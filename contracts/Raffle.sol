//Raffle
// Enter the lottery (1Eth per entry)
// Pick a random winner
// Winner selection to be selected per week
// use a chainlink oracle for randomness
// automated execution (chainlink keepers)

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error enterRaffle__insufficientAmount();
error Raffle__TransferFailed();

contract Raffle is VRFConsumerBaseV2 {
    /* State Variables */
    uint256 private immutable i_entranceFee;
    address payable[] public s_participants;
    address private winner;
    //request VRF parameters
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subId;
    uint16 private constant c_requestConfirmation = 3;
    uint32 private immutable i_callBackGaslimit;
    uint32 private constant c_numWords = 1;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;

    uint256 public myRandomWord;
    uint256 public myRequestId;

    /* Events */
    event RaffleEnter(address indexed participant);
    event requestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed recentWinner);

    //subscription ID:1184
    constructor(
        address vrfCoordinatorV2, // 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
        bytes32 _keyHash, // 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
        uint256 entranceFee,
        uint64 subId,
        uint32 callBackGaslimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_keyHash = _keyHash;
        i_subId = subId;
        i_callBackGaslimit = callBackGaslimit;
    }

    function enterRaffle() external payable {
        // require(msg.value > i_entranceFee)
        if (msg.value < i_entranceFee) {
            revert enterRaffle__insufficientAmount();
        }

        s_participants.push(payable(msg.sender));

        emit RaffleEnter(msg.sender);
    }

    function pickRandomWinner() external {
        //request the random number
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subId,
            c_requestConfirmation,
            i_callBackGaslimit,
            c_numWords
        );
        //once we get it, do something with it
        // 2 transaction process

        emit requestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /*requestId*/,
        uint256[] memory randomWords
    ) internal override {
        uint256 winnerIndex = randomWords[0] % s_participants.length;
        winner = s_participants[winnerIndex];

        (bool success, ) = payable(winner).call{value: address(this).balance}(
            ""
        );

        if (!success) {
            revert Raffle__TransferFailed();
        }

        emit WinnerPicked(winner);
    }

    /** pure/view */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getParticipant(uint256 index) public view returns (address) {
        return s_participants[index];
    }

    function getWinner() public view returns (address) {
        return winner;
    }

    // function pickRandomWinner() external {}
}
