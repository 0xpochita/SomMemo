//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../SomMemo.sol";

contract MockSomniaPreCompile {
    uint256 private nextId = 1;
    mapping(uint256 => bool) public activeSubscriptions;

    function subscribe(
        ISomniaReactivityPrecompile.SubscriptionData memory
    ) external returns (uint256) {
        uint256 id = nextId;
        nextId++;

        activeSubscriptions[id] = true;
        return id;
    }

    function unsubscribe(uint256 subscriptionId) external {
        activeSubscriptions[subscriptionId] = false;
    }

    function triggerOnEvent(
        address somMemoAddress,
        uint256 subscriptionId
    ) external {
        bytes32[] memory topics = new bytes32[](1);
        topics[0] = bytes32(subscriptionId);

        ISomniaEventHandler(somMemoAddress).onEvent(topics, "");
    }
}