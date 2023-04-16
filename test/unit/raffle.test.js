const { expect, assert } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", async () => {
      let deployer;
      let raffleContract;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        deployments.fixture("all");
        raffleContract = await ethers.getContract("Raffle", deployer);
      });
    });
