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
  : describe("Raffle", () => {
      let deployer,
        raffleContract,
        chainId,
        VRFCoordinatorContract,
        interval,
        subId,
        _value;

      beforeEach(async () => {
        _value = ethers.utils.parseEther("0.01");
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

      describe("constructor", () => {
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

      describe("enterRaffle", () => {
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

      describe("checkUpkeep", () => {
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

      describe("performUpkeep", () => {
        it("reverts if upKeep conditions are not met", async () => {
          await expect(
            raffleContract.performUpkeep([])
          ).to.be.revertedWithCustomError(
            raffleContract,
            "Raffle__UpKeepNotNeeded"
          );
        });

        it("run only if upKeep conditions are met", async () => {
          await raffleContract.enterRaffle({ value: _value });
          await network.provider.request({
            method: "evm_increaseTime",
            params: [Number(interval) + 1],
          });
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });
          await expect(raffleContract.performUpkeep([])).to.not.be.reverted;
        });

        it("updates the raffle state, emits an even, calls the vrf coordinator", async () => {
          //upkeep is true
          await raffleContract.enterRaffle({ value: _value });
          await network.provider.request({
            method: "evm_increaseTime",
            params: [Number(interval) + 1],
          });
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });

          const transactionResponse = await raffleContract.performUpkeep([]);
          const transactionReceipt = await transactionResponse.wait(1);

          const requestId = transactionReceipt.events[1].args["requestId"];
          assert(Number(requestId) > 0);

          assert.equal(await raffleContract.getRaffleState(), "1");
        });
      });

      describe("fulfillRandomWords", () => {
        beforeEach(async () => {
          await raffleContract.enterRaffle({ value: _value });
          await network.provider.request({
            method: "evm_increaseTime",
            params: [Number(interval) + 1],
          });
          await network.provider.request({
            method: "evm_mine",
            params: [],
          });
        });

        it("reverts if performUpKeep is not used", async () => {
          await expect(
            VRFCoordinatorContract.fulfillRandomWords(0, raffleContract.address)
          ).to.be.revertedWith("nonexistent request");
        });

        it("picks a winner, resets the raffle and sends money", async () => {
          const users = await ethers.getSigners();
          const initialTimestamp = raffleContract.getPreviousTimestamp();
          const initialParticipants = [];

          users.forEach(async (user, index) => {
            if (index != 0) {
              const raffle = raffleContract.connect(user);
              await raffle.enterRaffle({ value: _value });
            }
          });

          const initialWinnerBalance = await users[2].getBalance();
          const initialContractBalance = await ethers.provider.getBalance(
            raffleContract.address
          );

          const participantLength =
            await raffleContract.getParticipantNumbers();

          for (let i = 0; i < participantLength; i++) {
            initialParticipants.push(await raffleContract.getParticipant(i));
          }

          await new Promise(async (resolve, reject) => {
            raffleContract.once("s_winnerPicked", async (winnerAddress) => {
              try {
                console.log("event picked up!");
                const winner = await raffleContract.getWinner();
                const endingWinnerBalance = await ethers.provider.getBalance(
                  winner
                );
                const timestamp = await raffleContract.getPreviousTimestamp();
                const participant =
                  await raffleContract.getParticipantNumbers();
                const raffleState = await raffleContract.getRaffleState();
                const entranceFee = networkConfig[chainId].EntranceFee;
                const endingContractBalance = await ethers.provider.getBalance(
                  raffleContract.address
                );
                const winnerProfit =
                  endingWinnerBalance.sub(initialWinnerBalance);
                const gasUsed = initialContractBalance.sub(winnerProfit);

                // console.log("entrance fee:", entranceFee.toString());

                // console.log(
                //   "initial Contract Balance:",
                //   initialContractBalance.toString()
                // );
                // console.log(
                //   "ending Contract Balance:",
                //   endingContractBalance.toString()
                // );
                // console.log(
                //   "initial Winner Balance:",
                //   initialWinnerBalance.toString()
                // );
                // console.log(
                //   "ending Winner Balance:",
                //   endingWinnerBalance.toString()
                // );

                // console.log(
                //   "winner profit:",
                //   endingWinnerBalance.sub(initialWinnerBalance).toString()
                // );

                // console.log(
                //   "missing value: (gas cost?)",
                //   initialContractBalance.sub(winnerProfit).toString()
                // );

                assert.equal(
                  endingWinnerBalance.toString(),

                  initialWinnerBalance
                    .add(entranceFee.mul(participantLength))
                    .sub(gasUsed)
                    .toString()
                );
                assert.equal(participant, 0);
                assert.equal(winner, winnerAddress);
                assert.ok(initialParticipants.includes(winner));
                assert.ok(timestamp < initialTimestamp);
                assert.ok(initialParticipants.includes(winner));
                assert.equal(raffleState, "0");
              } catch (e) {
                reject(e);
              }
              resolve();
            });

            const tx = await raffleContract.performUpkeep([]);
            const txReciept = await tx.wait(1);

            await VRFCoordinatorContract.fulfillRandomWords(
              txReciept.events[1].args["requestId"],
              raffleContract.address
            );
          });
        });
      });

      describe("setRaffleState", () => {
        it("Owner can control raffle state", async () => {
          await raffleContract.setRaffleState("1"); //Closed
          await expect(
            raffleContract.enterRaffle({ value: _value })
          ).to.be.revertedWithCustomError(raffleContract, "Raffle__NotOpened");
        });
      });
    });
