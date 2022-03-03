// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;

    event NewWave (address indexed from, uint timestamp, string message);

    /* custom data type */
    struct Wave {
        address waver;
        string message;
        uint timestamp;
    }

    /* variable for storing an array of structs*/
    Wave[] waves;

    mapping(address => uint256) public lastWavedAt;
    
    constructor() payable {
        console.log("Version 4");
        /* set initial seed */
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function wave(string memory _message) public {

        /* building a delay function to prevent spamming */
        require(
            lastWavedAt[msg.sender] + 15 minutes < block.timestamp, "Please wait 15 minutes"
        );
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        console.log("%s has waved!", msg.sender);

        /* storing the interaction */
        waves.push(Wave(msg.sender, _message, block.timestamp));
        /* generate new seed for next user */
        seed = (block.difficulty + block.timestamp + seed) % 100;

        /* chance of winning prize */
        if (seed <= 5) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.01 ether;
            require(
                prizeAmount <= address(this).balance, "There's no prize money left =("
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw prize from contract");
        }

        emit NewWave(msg.sender, block.timestamp, _message);

    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

}