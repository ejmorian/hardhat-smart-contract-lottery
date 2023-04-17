require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-gas-reporter");

const privateKey =
  "0xf8cd2a427b162332f0fe66323a10c61ad797b9bfe07495e6e8869b5e0dd05e88";

const privateKey2 =
  "e566a72e6bea90728706acca4ccd37a8c86c3fc1b7cf3eddd7f31384b5433d9e";

const privateKey3 =
  "dd631cf758b3b0d72462b2cdcd4b4f1c5ead133e4b12c814f1ff2c13b127281a";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      { version: "0.8.18" },
      { version: "0.4.11" },
      { version: "0.4.24" },
    ],
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
      gasPrice: 0,
    },
    hardhat: {
      gasPrice: 14375000000,
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/mM7jvgG7LNx9C4YZRHGf5z1vUAmFXT6n",
      chainId: 11155111,
      accounts: [privateKey, privateKey2, privateKey3],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: "62IZQPP73I7JBGV6E8I6EG8P9C3SPVGIRN",
  },
  mocha: {
    timeout: 300000,
  },
  gasReporter: {
    enabled: false,
  },
};
