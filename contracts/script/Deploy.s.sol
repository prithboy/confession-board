// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/ConfessionBoard.sol";

contract Deploy is Script {
    // Arc Testnet USDC address — update if needed
    // Check https://docs.arc.io for current testnet token addresses
    address constant ARC_TESTNET_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        ConfessionBoard board = new ConfessionBoard(ARC_TESTNET_USDC);

        console.log("ConfessionBoard deployed at:", address(board));
        console.log("USDC token:", ARC_TESTNET_USDC);
        console.log("Week starts:", block.timestamp);

        vm.stopBroadcast();
    }
}
