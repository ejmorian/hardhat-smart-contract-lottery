const { ethers } = require("hardhat");

const developmentChains = ["hardhat", "localhost"];

const networkConfig = {
  11155111: {
    name: "sepolia",
    VRFCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    KeyHash:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    EntranceFee: ethers.utils.parseEther("0.01"),
    SubscriptionId: "1184",
    CallBackGasLimit: "500000",
    Interval: "30",
  },
  31337: {
    name: "hardhat",
    EntranceFee: ethers.utils.parseEther("0.01"),
    KeyHash:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    CallBackGasLimit: "500000",
    Interval: "30",
  },
};

module.exports = {
  networkConfig,
  developmentChains,
};
