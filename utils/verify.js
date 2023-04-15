const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  try {
    await run("verify", {
      address: contractAddress,
      constructorArgsParams: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("verified")) {
      console.log("contract is already verified..");
    } else {
      console.error(error);
    }
  }
};

module.exports = {
  verify,
};
