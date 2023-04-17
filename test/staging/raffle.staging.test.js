const { expect, assert } = require("chai");
const { network, getNamedAccounts, ethers, getChainId } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Sepolia Live network, staging test", () => {
      let deployer, raffleContract, chainId, interval, entranceFee;

      //deploy contract
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        raffleContract = await ethers.getContract("Raffle", deployer);
        interval = await raffleContract.getInterval();
        chainId = await getChainId();

        entranceFee = await networkConfig[chainId].EntranceFee;
      });

      //staging
      describe("It works in a live network and connect with Chainlinkk VRF and upKeep", () => {
        //Users Enter Raffle
        let participants;
        beforeEach(async () => {
          participants = await ethers.getSigners();
          participants.forEach(async (user) => {
            const connectedContract = await raffleContract.connect(user);
            const tx = await connectedContract.enterRaffle({
              value: entranceFee,
            });
            await tx.wait(3);
          });
        });
        //
        describe("fulfillRandomWords", () => {
          it("emits an event, picks a winner, and winner recieves the money", async () => {
            const initialBalance = participants.map(async (user) => {
              const address = user.address;
              const balance = await ethers.provider.getBalance(address);
              return { address: balance };
            });
            // wait for the VRF Chainlink to respond...
            await new Promise(async (resolve, rejected) => {
              raffleContract.once("s_winnerPicked", async (winnerAddress) => {
                try {
                  let winnerInitialBalance;
                  const winnerEndingBalance = await ethers.provider.getBalance(
                    winnerAddress
                  );

                  const winnerPicked = await raffleContract.getWinner();
                  assert.equal(winnerAddress, winnerPicked);

                  initialBalance.forEach(async (user) => {
                    if (user.hasOwnProperty(winnerAddress)) {
                      winnerInitialBalance = user[winnerAddress];
                    }
                  });

                  assert(
                    winnerEndingBalance,
                    winnerInitialBalance.add(
                      entranceFee.mul(participants.length)
                    )
                  );
                  resolve();
                } catch (e) {
                  rejected(e);
                }
              });
            });
          });
        });
      });
    });
