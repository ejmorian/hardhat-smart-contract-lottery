const { expect, assert } = require("chai");
const { ethers, network, getChainId } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Live Sepolia Test Network", () => {
      let raffleContract,
        users,
        userOneRaffle,
        userTwoRaffle,
        userThreeRaffle,
        entraceFee,
        interval;

      beforeEach(async () => {
        //get the user accounts and the raffle contract
        raffleContract = await ethers.getContract("Raffle");
        users = await ethers.getSigners();

        userOneRaffle = raffleContract.connect(users[0]);
        userTwoRaffle = raffleContract.connect(users[1]);
        userThreeRaffle = raffleContract.connect(users[2]);

        entraceFee = networkConfig[await getChainId()]["EntranceFee"];
        interval = networkConfig[await getChainId()]["Interval"];
      });

      it("winner is picked, recieves the correct amount", async () => {
        //Users Enter the Raffle
        console.log("users entering the raffle");
        const lastTimestamp = await raffleContract.getPreviousTimestamp();
        console.log("lastTimestamp:", lastTimestamp);
        console.log("picking winner after. interval:", interval, "seconds");
        try {
          const tx1 = await userOneRaffle.enterRaffle({
            value: entraceFee,
            gasLimit: 500000,
          });
          console.log("userOne has entered");

          const tx2 = await userTwoRaffle.enterRaffle({
            value: entraceFee,
            gasLimit: 500000,
          });
          console.log("userTwo has entered");

          const tx3 = await userThreeRaffle.enterRaffle({
            value: entraceFee,
            gasLimit: 500000,
          });
          await tx3.wait();

          console.log("userThree has entered");
        } catch (e) {
          console.log("a transaction has been reverted...");
          console.error(e);
        }
        //User finished enterting the raffle

        //get the participants number, how many users have joined the raffle succesfuly
        const participants = await raffleContract.getParticipantNumbers();
        console.log(`${participants.toString()} have entered the raffle.`);

        //get mapping of user address and their current balances
        const initialBalances = [
          { [await users[0].address]: [await users[0].getBalance()] },
          { [await users[1].address]: [await users[1].getBalance()] },
          { [await users[2].address]: [await users[2].getBalance()] },
        ];
        console.log(initialBalances);

        //Wait for Chainlink VRF and Upkeep to perform the upkeep in order to pick a winner.
        await new Promise(async (resolve, reject) => {
          raffleContract.once("s_winnerPicked", async (winnerAddress) => {
            try {
              console.log(
                "Event has been emmited, winner has been picked!",
                winnerAddress
              );

              //get the timestamp variable
              const newTimestamp = await raffleContract.getPreviousTimestamp();
              console.log("newTimestamp:", newTimestamp);
              const executionTime =
                newTimestamp.toString() - lastTimestamp.toString();

              console.log(newTimestamp.toString() - lastTimestamp.toString());
              // get the winner address from contract
              const contractWinner = await raffleContract.getWinner();

              const winnerEndingBalance = await ethers.provider.getBalance(
                winnerAddress
              );
              let winnerInitialBalance;

              //get the initial winner balance before the prizepool is rewarded
              console.log("looking for winners initial balance");
              initialBalances.forEach((account) => {
                if (account.hasOwnProperty(winnerAddress)) {
                  console.log("found it");
                  winnerInitialBalance = account[winnerAddress];
                  console.log(account);
                } else {
                  console.log("not this one...");
                }
              });

              //calculate if the reward has been given with the right amount
              const winnerProfit =
                winnerEndingBalance.toString() -
                winnerInitialBalance.toString();
              const rafflePrizePool = entraceFee.mul(participants).toString();

              //check if winner is picked
              assert.equal(winnerAddress, contractWinner);

              //check if winner recieved the right amount
              assert.equal(winnerProfit, rafflePrizePool);

              //check if execution time is after the interval
              assert.ok(executionTime > interval);

              resolve();
            } catch (e) {
              console.error(e);
              reject(e);
            }
          });
        });
      });
    });
