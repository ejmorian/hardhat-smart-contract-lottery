//Raffle
// Enter the lottery (1Eth per entry)
// Pick a random winner
// Winner selection to be selected per week
// use a chainlink oracle for randomness
// automated execution (chainlink keepers)

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

    function getEntranceFee() public view returns (uint256) {}

    function getParticipant(uint256 index) public view returns (address) {
        return s_participants[index];
    }

    // function pickRandomWinner() external {}
}
