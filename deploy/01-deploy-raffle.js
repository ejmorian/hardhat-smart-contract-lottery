const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = await getChainId();

  let VRFCoordinatorV2Address;
  let KeyHash;
  let SubId;

  if (developmentChains.includes(network.name)) {
    VRFCoordinatorV2 = await ethers.getContract(
      "VRFCoordinatorV2Mock",
      deployer
    );

    VRFCoordinatorV2Address = VRFCoordinatorV2.address;

    KeyHash = networkConfig[chainId]["KeyHash"];

    const transactionResponse = await VRFCoordinatorV2.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    SubId = transactionReceipt.events[0].args.subId;

    const vrfFundAmount = ethers.utils.parseEther("2");
    await VRFCoordinatorV2.fundSubscription(SubId, vrfFundAmount);
  } else {
    VRFCoordinatorV2Address = networkConfig[chainId]["VRFCoordinatorV2"];
    KeyHash = networkConfig[chainId]["KeyHash"];
    SubId = networkConfig[chainId]["SubscriptionId"];
  }

  const EntranceFee = networkConfig[chainId]["EntranceFee"];
  const Interval = networkConfig[chainId]["Interval"];
  const CallBackGasLimit = networkConfig[chainId]["CallBackGasLimit"];

  const args = [
    VRFCoordinatorV2Address,
    KeyHash,
    EntranceFee.toString(),
    SubId,
    CallBackGasLimit,
    Interval,
  ];

  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: 6,
  });
  console.log("Raffle contract deployed...");

  if (!developmentChains.includes(network.name)) {
    console.log("verifying contract...");
    await verify(raffle.address, args);
    console.log("verified");
  } else {
    console.log("in a development chain... can not verify contract.");
  }
};

module.exports.tags = ["all", "raffle"];
