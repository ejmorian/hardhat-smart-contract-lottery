//Raffle
// Enter the lottery (1Eth per entry)
// Pick a random winner
// Winner selection to be selected per week
// use a chainlink oracle for randomness
// automated execution (chainlink keepers)

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
//subscription ID:1184

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

error enterRaffle__insufficientAmount();

contract Raffle {
    /* State Variables */
    uint256 private immutable i_entranceFee;
    address payable[] public s_participants;

    /* Events */
    event RaffleEnter(address indexed participant);

    constructor(uint256 entranceFee) {
        i_entranceFee = entranceFee;
    }

    function enterRaffle() external payable {
        // require(msg.value > i_entranceFee)
        if (msg.value < i_entranceFee) {
            revert enterRaffle__insufficientAmount();
        }

        s_participants.push(payable(msg.sender));

        emit RaffleEnter(msg.sender);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getParticipant(uint256 index) public view returns (address) {
        return s_participants[index];
    }

    // function pickRandomWinner() external {}
}
