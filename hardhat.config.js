require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-gas-reporter");

const privateKey =
  "0xf8cd2a427b162332f0fe66323a10c61ad797b9bfe07495e6e8869b5e0dd05e88";

const privateKey2 =
  "8f80e98dd7152441e9ac3b882d61abbbdd1a85cd59d66bb3c76c0e5d9f27cfa4"; //0x23Bd2D8A40b1BC32025c1b05Cab9E13a5e85C8c4

const privateKey3 =
  "0f0d2a9cd0795abbcab461674588f1378cda0c843b5611d57b362686f80ebb2d"; //0xcD75aA9aea4dbA7d93bb81d5C4511699dF1d8695

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
