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
      let deployer, raffleContract, chainId, VRFCoordinatorContract;

      beforeEach(async () => {
        chainId = await getChainId();
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture("all");
        raffleContract = await ethers.getContract("Raffle", deployer);
        VRFCoordinatorContract = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("Constructor", async () => {
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
    });
