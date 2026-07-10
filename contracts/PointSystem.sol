// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IFanBadgeNFT {
    function badgeLevels(uint256 tokenId) external view returns (uint256);
    function upgrade(uint256 tokenId) external;
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
}

contract PointSystem is Ownable, ReentrancyGuard {
    IFanBadgeNFT public badgeNFT;

    struct UserInfo {
        uint256 points;
        uint256 lastCheckIn;
        uint256 totalDonated;
    }

    struct Proposal {
        string description;
        uint256 voteCount;
        uint256 endTime;
        bool exists;
        mapping(address => bool) hasVoted;
    }

    mapping(address => UserInfo) public users;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    
    uint256 public constant POINTS_PER_CHECKIN = 10;
    uint256 public constant POINTS_PER_LIKE = 2;
    uint256 public constant POINTS_PER_SUPPORT = 20; // Support a song
    uint256 public constant POINTS_PER_DONATION_UNIT = 100; // per 1 MON (simulated)
    uint256 public constant UPGRADE_COST_BASE = 50;

    event CheckedIn(address indexed user, uint256 pointsEarned);
    event Interacted(address indexed user, string action, uint256 pointsEarned);
    event PointsSpent(address indexed user, uint256 amount);
    event Donated(address indexed user, uint256 amount, uint256 pointsEarned);
    event ProposalCreated(uint256 indexed id, string description, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, uint256 weight);

    constructor(address _badgeNFT) Ownable(msg.sender) {
        badgeNFT = IFanBadgeNFT(_badgeNFT);
    }

    modifier onlyBadgeHolder() {
        require(badgeNFT.balanceOf(msg.sender) > 0, "Must hold a fan badge");
        _;
    }

    function checkIn() external onlyBadgeHolder {
        require(block.timestamp >= users[msg.sender].lastCheckIn + 1 days, "Already checked in today");
        
        users[msg.sender].points += POINTS_PER_CHECKIN;
        users[msg.sender].lastCheckIn = block.timestamp;
        
        emit CheckedIn(msg.sender, POINTS_PER_CHECKIN);
    }

    function supportSong(string calldata songTitle) external onlyBadgeHolder {
        users[msg.sender].points += POINTS_PER_SUPPORT;
        emit Interacted(msg.sender, string(abi.encodePacked("support:", songTitle)), POINTS_PER_SUPPORT);
    }

    function like() external onlyBadgeHolder {
        users[msg.sender].points += POINTS_PER_LIKE;
        emit Interacted(msg.sender, "like", POINTS_PER_LIKE);
    }

    function donate() external payable onlyBadgeHolder nonReentrant {
        require(msg.value > 0, "Donation must be > 0");
        
        // Calculate points: 100 points per 1 MON (1e18 wei)
        uint256 pointsEarned = (msg.value * POINTS_PER_DONATION_UNIT) / 1e18;
        
        users[msg.sender].points += pointsEarned;
        users[msg.sender].totalDonated += msg.value;
        
        // Forward funds to creator (owner)
        (bool success, ) = payable(owner()).call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit Donated(msg.sender, msg.value, pointsEarned);
    }

    function createProposal(string calldata description, uint256 durationInDays) external {
        if (msg.sender != owner()) {
            uint256 tokenId = badgeNFT.tokenOfOwnerByIndex(msg.sender, 0);
            require(badgeNFT.badgeLevels(tokenId) >= 10, "Only owner or Legendary Fans can create proposals");
        }
        
        proposalCount++;
        Proposal storage p = proposals[proposalCount];
        p.description = description;
        p.endTime = block.timestamp + (durationInDays * 1 days);
        p.exists = true;
        
        emit ProposalCreated(proposalCount, description, p.endTime);
    }

    function vote(uint256 proposalId) external onlyBadgeHolder {
        Proposal storage p = proposals[proposalId];
        require(p.exists, "Proposal does not exist");
        require(block.timestamp < p.endTime, "Voting ended");
        require(!p.hasVoted[msg.sender], "Already voted");

        uint256 tokenId = badgeNFT.tokenOfOwnerByIndex(msg.sender, 0);
        uint256 level = badgeNFT.badgeLevels(tokenId);
        
        // Voting weight = Level + (Points / 100)
        uint256 weight = level + (users[msg.sender].points / 100);
        
        p.voteCount += weight;
        p.hasVoted[msg.sender] = true;
        
        emit Voted(proposalId, msg.sender, weight);
    }

    function hasVoted(uint256 proposalId, address user) external view returns (bool) {
        return proposals[proposalId].hasVoted[user];
    }

    function getProposal(uint256 proposalId) external view returns (string memory description, uint256 voteCount, uint256 endTime, bool exists) {
        Proposal storage p = proposals[proposalId];
        return (p.description, p.voteCount, p.endTime, p.exists);
    }

    function upgradeBadge() external onlyBadgeHolder {
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
