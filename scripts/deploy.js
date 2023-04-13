const { ethers } = require("hardhat");

const main = async () => {
  const [userOne] = await ethers.getSigners();
  const raffleFactory = await ethers.getContractFactory("Raffle", userOne);
  console.log("deploying contract..");
  const raffle = await raffleFactory.deploy(50);
  await raffle.deployed();
  console.log("succesfully deployed:", raffle.address);
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
