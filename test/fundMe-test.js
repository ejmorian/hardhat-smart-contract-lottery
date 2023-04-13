const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("FundMe", async () => {
  let deployer;
  let raffle;
  let entranceFee = "10";
  let value = "1";
  beforeEach(async () => {
    deployer = (await ethers.getSigners())[0];
    const raffleFactory = await ethers.getContractFactory("Raffle", deployer);
    raffle = await raffleFactory.deploy(entranceFee);
    await raffle.deployed();
  });

  describe("constructor", async () => {
    it("correct value of entrance fee is passed", async () => {
      const returnValue = await raffle.getEntranceFee();
      assert.equal(returnValue.toString(), entranceFee);
    });
  });

  describe("Enter Raffle", async () => {
    it("reverts if amount sent is insufficient", async () => {
      await expect(
        raffle.enterRaffle({ value: value, gasLimit: 30000000 })
      ).to.be.revertedWithCustomError(
        raffle,
        "enterRaffle__insufficientAmount"
      );
    });

    it("adds the address of the participant to the list", async () => {
      await raffle.enterRaffle({ value: "11", gasLimit: 30000000 });
      const expectedValue = await raffle.getParticipant(0);
      const deployerAddress = deployer.address;
      assert.equal(expectedValue, deployerAddress);
    });

    it("emits event", async () => {
      const sender = deployer.address;
      let address;

      const transactionResponse = await raffle.enterRaffle({
        value: "11",
        gasLimit: 30000000,
      });

      const transactionReceipt = await transactionResponse.wait(1);
      address = transactionReceipt.events[0].args["participant"];

      assert.equal(sender, address);
    });
  });
});
