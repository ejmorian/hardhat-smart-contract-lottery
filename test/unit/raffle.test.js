const { expect, assert } = require("chai");
const {
  network,
  getNamedAccounts,
  deployments,
  ethers,
  getChainId,
} = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async () => {
      let deployer,
        raffleContract,
        chainId,
        VRFCoordinatorContract,
        interval,
        subId,
        _value;

      beforeEach(async () => {
        _value = ethers.utils.parseEther("0.1");
        chainId = await getChainId();
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture("all");
        raffleContract = await ethers.getContract("Raffle", deployer);
        VRFCoordinatorContract = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        interval = networkConfig[chainId].Interval;
        subId = await raffleContract.getSubId();
        await VRFCoordinatorContract.addConsumer(subId, raffleContract.address);
      });

      describe("constructor", async () => {
        it("initialises an open state raffle", async () => {
          assert.equal((await raffleContract.getRaffleState()).toString(), "0");
        });

        it("constructor takes in the correct value", async () => {
          //expected args
          const vrfCoordinatorV2 = (
            await ethers.getContract("VRFCoordinatorV2Mock")
          ).address;
          const keyHash = networkConfig[chainId].KeyHash;
          const entranceFee = networkConfig[chainId].EntranceFee;
          //   const subId = networkConfig[chainId].subId;
          const callBackGasLimit = networkConfig[chainId].CallBackGasLimit;
          const interval = networkConfig[chainId].Interval;
          //actual args

          const VrfCoordinatorV2 = await raffleContract.getVrfCoordinator();
          const KeyHash = await raffleContract.getKeyHash();
          const EntranceFee = await raffleContract.getEntranceFee();
          const SubId = await raffleContract.getSubId();
          const CallBackGasLimit = await raffleContract.getCallBackGasLimit();
          const Interval = await raffleContract.getInterval();

          assert.equal(VrfCoordinatorV2, vrfCoordinatorV2);
          assert.equal(KeyHash, keyHash);
          assert.equal(EntranceFee.toString(), entranceFee.toString());
          //   assert.equal(subId, SubId);
          assert.equal(callBackGasLimit, CallBackGasLimit);
          assert.equal(interval.toString(), Interval.toString());
        });
      });

      describe("enterRaffle", async () => {
        it("revert transaction if insufficient value is sent", async () => {
          await expect(
            raffleContract.enterRaffle({ value: 0 })
          ).to.be.revertedWithCustomError(
            raffleContract,
            "enterRaffle__insufficientAmount"
          );
        });

        it("adds the address in the participants list", async () => {
          await raffleContract.enterRaffle({ value: _value });
          const addressRecorded = await raffleContract.getParticipant(0);
          assert.equal(addressRecorded, deployer);
        });

        it("emits an event with address of the participant", async () => {
          const transactionResponse = await raffleContract.enterRaffle({
            value: _value,
          });
          const transactionReceipt = await transactionResponse.wait(1);
          const emitEventArgs =
            transactionReceipt.events[0].args["participant"];
          assert.equal(deployer, emitEventArgs);
        });

        it("entrance not allowed when raffle is in calculating winner state", async () => {
          await raffleContract.enterRaffle({ value: _value });
          await network.provider.request({
            method: "evm_increaseTime",
            params: [Number(interval) + 1],
          });
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });

          await raffleContract.performUpkeep([]);
          await expect(
            raffleContract.enterRaffle({ value: _value })
          ).to.be.revertedWithCustomError(raffleContract, "Raffle__NotOpened");
        });
      });

      describe("checkUpkeep", async () => {
        it("return false if people haven't sent eth", async () => {
          await network.provider.request({
            method: "evm_increaseTime",
            params: [Number(interval) + 1],
          });
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });
          const { upkeepNeeded } = await raffleContract.callStatic.checkUpkeep(
            []
          );
          assert(!upkeepNeeded);
        });

        it("return false if raffle is not open", async () => {
          await network.provider.request({
            method: "evm_increaseTime",
            params: [Number(interval) + 1],
          });
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });
          await raffleContract.enterRaffle({ value: _value });
          await raffleContract.performUpkeep([]);
          const { upkeepNeeded } = await raffleContract.callStatic.checkUpkeep(
            []
          );

          const raffleState = await raffleContract.getRaffleState();
          assert(raffleState.toString(), "1");
          assert(!upkeepNeeded);
        });

        it("retuns false if enough time has passed", async () => {
          await raffleContract.enterRaffle({ value: _value });
          await network.provider.request({
            method: "evm_increaseTime",
            params: [Number(interval) - 2],
          });
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });

          const { upkeepNeeded } = await raffleContract.callStatic.checkUpkeep(
            []
          );
          assert.equal(upkeepNeeded, false);
        });

        it("retuns true if enough time has passed, has enough players, raffle is open, and smart contract has balance", async () => {
          await raffleContract.enterRaffle({ value: _value });
          await network.provider.request({
            method: "evm_increaseTime",
            params: [Number(interval) + 1],
          });
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });

          const { upkeepNeeded } = await raffleContract.callStatic.checkUpkeep(
            []
          );
          assert.equal(upkeepNeeded, true);
        });
      });

      describe("setRaffleState", async () => {
        it("Owner can control raffle state", async () => {
          await raffleContract.setRaffleState("1"); //Closed
          await expect(
            raffleContract.enterRaffle({ value: _value })
          ).to.be.revertedWithCustomError(raffleContract, "Raffle__NotOpened");
        });
      });
    });
