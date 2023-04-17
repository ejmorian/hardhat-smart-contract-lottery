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
          console.log("Users entering the raffle...");
          participants = await ethers.getSigners();

          const [userOne, userTwo, userThree] = participants;

          const userOneContract = await raffleContract.connect(userOne);
          const tx1 = await userOneContract.enterRaffle({ value: entranceFee });
          await tx1.wait(3);

          const userTwoContract = await raffleContract.connect(userTwo);
          const tx2 = await userTwoContract.enterRaffle({ value: entranceFee });
          await tx2.wait(3);

          const userThreeContract = await raffleContract.connect(userThree);
          const tx3 = await userThreeContract.enterRaffle({
            value: entranceFee,
          });
          await tx3.wait(3);

          //   participants.forEach(async (user) => {
          //     const connectedContract = await raffleContract.connect(user);
          //     const tx = await connectedContract.enterRaffle({
          //       value: entranceFee,
          //     });
          //     await tx.wait(3);
          //   });
          console.log("Users succesfully entered!");
        });

        describe("fulfillRandomWords", () => {
          it("emits an event, picks a winner, and winner recieves the money", async () => {
            const initialBalance = participants.map(async (user) => {
              const userAddress = await user.address;
              const balance = await ethers.provider.getBalance(userAddress);
              const account = { [userAddress]: balance };

              return account;
            });
            const participantNumbers =
              await raffleContract.getParticipantNumbers();

            // wait for the VRF Chainlink to respond...
            console.log("participants: ", participantNumbers.toString());
            console.log(await initialBalance);
            const prizePool = await ethers.provider.getBalance(
              raffleContract.address
            );
            await new Promise(async (resolve, rejected) => {
              raffleContract.once("s_winnerPicked", async (winnerAddress) => {
                try {
                  console.log("Winner Picked!", winnerAddress);

                  const winnerPicked = await raffleContract.getWinner();
                  assert.equal(winnerAddress, winnerPicked);

                  const winnerEndingBalance = await ethers.provider.getBalance(
                    winnerAddress
                  );
                  let winnerInitialBalance;
                  initialBalance.forEach(async (user) => {
                    if (user.hasOwnProperty(winnerAddress)) {
                      winnerInitialBalance = await user[winnerAddress];
                      console.log(await winnerInitialBalance.toString());
                    } else {
                      console.log("something went wrong...");
                    }
                  });

                  const expectedEndingBalance = await winnerInitialBalance.add(
                    prizePool
                  );

                  assert.equal(winnerEndingBalance, expectedEndingBalance);

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
