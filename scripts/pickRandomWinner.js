const { ethers } = require("hardhat");

const abi = [
  {
    inputs: [
      { internalType: "address", name: "vrfCoordinatorV2", type: "address" },
      { internalType: "bytes32", name: "_keyHash", type: "bytes32" },
      { internalType: "uint256", name: "entranceFee", type: "uint256" },
      { internalType: "uint64", name: "subId", type: "uint64" },
      { internalType: "uint32", name: "callBackGaslimit", type: "uint32" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { internalType: "address", name: "have", type: "address" },
      { internalType: "address", name: "want", type: "address" },
    ],
    name: "OnlyCoordinatorCanFulfill",
    type: "error",
  },
  { inputs: [], name: "enterRaffle__insufficientAmount", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "participant",
        type: "address",
      },
    ],
    name: "RaffleEnter",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
    ],
    name: "requestedRaffleWinner",
    type: "event",
  },
  {
    inputs: [],
    name: "enterRaffle",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getEntranceFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getParticipant",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "myRandomWord",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "myRequestId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pickRandomWinner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "uint256[]", name: "randomWords", type: "uint256[]" },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "s_participants",
    outputs: [{ internalType: "address payable", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

const main = async () => {
  const [signer] = await ethers.getSigners();
  const raffle = new ethers.Contract(
    "0x1eea4ecE38dde76AD09D546f0CD7abfc11cf835a",
    abi,
    signer
  );

  console.log("calling pickRandomWinner function...");
  const transactionResponse = await raffle.pickRandomWinner();
  console.log("tx hash:", transactionResponse.hash);
  await transactionResponse.wait(6);

  console.log("done...");

  const word = await raffle.myRandomWord();
  const id = await raffle.myRequestId();

  console.log("word:", word, "id:", id);
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
