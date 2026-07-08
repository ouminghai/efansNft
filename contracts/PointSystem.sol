// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFanBadgeNFT {
    function badgeLevels(uint256 tokenId) external view returns (uint256);
    function upgrade(uint256 tokenId) external;
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}

contract PointSystem is Ownable {
    IFanBadgeNFT public badgeNFT;

    struct UserInfo {
        uint256 points;
        uint256 lastCheckIn;
    }

    mapping(address => UserInfo) public users;
    
    uint256 public constant POINTS_PER_CHECKIN = 10;
    uint256 public constant POINTS_PER_LIKE = 2;
    uint256 public constant POINTS_PER_VOTE = 5;
    uint256 public constant UPGRADE_COST_BASE = 50;

    event CheckedIn(address indexed user, uint256 pointsEarned);
    event Interacted(address indexed user, string action, uint256 pointsEarned);
    event PointsSpent(address indexed user, uint256 amount);

    constructor(address _badgeNFT) Ownable(msg.sender) {
        badgeNFT = IFanBadgeNFT(_badgeNFT);
    }

    function checkIn() external {
        require(block.timestamp >= users[msg.sender].lastCheckIn + 1 days, "Already checked in today");
        
        users[msg.sender].points += POINTS_PER_CHECKIN;
        users[msg.sender].lastCheckIn = block.timestamp;
        
        emit CheckedIn(msg.sender, POINTS_PER_CHECKIN);
    }

    function interact(string calldata action) external {
        uint256 points = 0;
        if (keccak256(bytes(action)) == keccak256(bytes("like"))) {
            points = POINTS_PER_LIKE;
        } else if (keccak256(bytes(action)) == keccak256(bytes("vote"))) {
            points = POINTS_PER_VOTE;
        } else {
            revert("Invalid action");
        }

        users[msg.sender].points += points;
        emit Interacted(msg.sender, action, points);
    }

    function upgradeBadge() external {
        require(badgeNFT.balanceOf(msg.sender) > 0, "No badge to upgrade");
        uint256 tokenId = badgeNFT.tokenOfOwnerByIndex(msg.sender, 0);
        uint256 currentLevel = badgeNFT.badgeLevels(tokenId);
        
        uint256 cost = currentLevel * UPGRADE_COST_BASE;
        require(users[msg.sender].points >= cost, "Insufficient points");

        users[msg.sender].points -= cost;
        badgeNFT.upgrade(tokenId);
        
        emit PointsSpent(msg.sender, cost);
    }

    function getPoints(address user) external view returns (uint256) {
        return users[user].points;
    }
}
