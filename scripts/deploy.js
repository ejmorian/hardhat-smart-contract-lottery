const { ethers, network } = require("hardhat");
const { verify } = require("./verify");

// const args = {
//   vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
//   _keyHash:
//     "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
//   entranceFee: 1,
//   subId: 1184,
//   callBackGaslimit: 1000000,
// };

const args = [
  "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
  "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
  "0",
  "1184",
  "1000000",
];

const main = async () => {
  const [userOne] = await ethers.getSigners();
  const raffleFactory = await ethers.getContractFactory("Raffle", userOne);
  console.log("deploying contract..");

  const raffle = await raffleFactory.deploy(
    args[0],
    args[1],
    args[2],
    args[3],
    args[4]
  );

  const blockhash = raffle.deployTransaction.hash;

  console.log("depolyed contract... waiting for confirmation.");
  console.log("tx hash:", blockhash);

  await raffle.deployTransaction.wait(6);

  console.log("succesfully deployed:", raffle.address);

  if (network.name.includes("sepolia")) {
    console.log("verifying contract on etherscan...");
    await verify(raffle.address, args);
  } else {
    console.log("in a local network. cannot verify...");
  }
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
