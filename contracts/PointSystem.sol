// SPDX-License-Identifier: MIT
// 软件许可证声明，使用 MIT 许可证
pragma solidity ^0.8.24;
// 指定 Solidity 编译器版本为 0.8.24 或更高

import "@openzeppelin/contracts/access/Ownable.sol";
// 引入 OpenZeppelin 的所有权控制合约
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// 引入防重入攻击保护合约

interface IFanBadgeNFT {
    // 定义 IFanBadgeNFT 接口，用于与 NFT 合约交互
    function badgeLevels(uint256 tokenId) external view returns (uint256);
    // 获取指定勋章的等级
    function upgrade(uint256 tokenId) external;
    // 调用 NFT 合约的升级函数
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
    // 根据所有者和索引获取代币 ID
    function balanceOf(address owner) external view returns (uint256);
    // 获取指定地址持有的代币数量
}

contract PointSystem is Ownable, ReentrancyGuard {
    // 定义积分系统合约，继承 Ownable 和 ReentrancyGuard
    IFanBadgeNFT public badgeNFT;
    // 存储关联的 NFT 合约实例

    struct UserInfo {
        // 用户信息结构体
        uint256 points;
        // 用户当前可用积分
        uint256 lastCheckIn;
        // 上次签到的时间戳
        uint256 totalDonated;
        // 累计捐赠总额（以 Wei 为单位）
    }

    struct Proposal {
        // 提案结构体
        string description;
        // 提案描述内容
        uint256 voteCount;
        // 累计获得的投票权重
        uint256 endTime;
        // 投票截止时间戳
        bool exists;
        // 标记提案是否存在
        mapping(address => bool) hasVoted;
        // 记录用户是否已针对此提案投票
    }

    mapping(address => UserInfo) public users;
    // 映射：地址 => 用户信息
    mapping(uint256 => Proposal) public proposals;
    // 映射：提案 ID => 提案内容
    uint256 public proposalCount;
    // 累计提案数量
    
    uint256 public constant POINTS_PER_CHECKIN = 10;
    // 常量：每次签到获得的积分（10分）
    uint256 public constant POINTS_PER_LIKE = 2;
    // 常量：每次点赞获得的积分（2分）
    uint256 public constant POINTS_PER_SUPPORT = 20;
    // 常量：每次支持歌曲获得的积分（20分）
    uint256 public constant POINTS_PER_DONATION_UNIT = 100;
    // 常量：每捐赠 1 MON 获得的积分单位（100分/MON）
    uint256 public constant UPGRADE_COST_BASE = 50;
    // 常量：升级勋章的基础成本系数

    event CheckedIn(address indexed user, uint256 pointsEarned);
    // 事件：签到成功时触发
    event Interacted(address indexed user, string action, uint256 pointsEarned);
    // 事件：用户互动（如点赞、支持）时触发
    event PointsSpent(address indexed user, uint256 amount);
    // 事件：用户消耗积分时触发
    event Donated(address indexed user, uint256 amount, uint256 pointsEarned);
    // 事件：用户完成捐赠时触发
    event ProposalCreated(uint256 indexed id, string description, uint256 endTime);
    // 事件：新提案创建时触发
    event Voted(uint256 indexed proposalId, address indexed voter, uint256 weight);
    // 事件：用户投票成功时触发

    constructor(address _badgeNFT) Ownable(msg.sender) {
        // 构造函数：初始化关联的 NFT 合约地址，并设置部署者为所有者
        badgeNFT = IFanBadgeNFT(_badgeNFT);
        // 实例化接口对象
    }

    modifier onlyBadgeHolder() {
        // 修饰符：限制仅允许持有勋章的用户调用
        require(badgeNFT.balanceOf(msg.sender) > 0, "Must hold a fan badge");
        // 检查调用者余额是否大于 0
        _;
        // 继续执行函数体
    }

    function checkIn() external onlyBadgeHolder {
        // 函数：签到功能
        require(block.timestamp >= users[msg.sender].lastCheckIn + 1 days, "Already checked in today");
        // 限制：每 24 小时只能签到一次
        
        users[msg.sender].points += POINTS_PER_CHECKIN;
        // 增加用户积分
        users[msg.sender].lastCheckIn = block.timestamp;
        // 更新上次签到时间为当前时间
        
        emit CheckedIn(msg.sender, POINTS_PER_CHECKIN);
        // 触发签到事件
    }

    function supportSong(string calldata songTitle) external onlyBadgeHolder {
        // 函数：支持特定歌曲
        users[msg.sender].points += POINTS_PER_SUPPORT;
        // 增加用户积分
        emit Interacted(msg.sender, string(abi.encodePacked("support:", songTitle)), POINTS_PER_SUPPORT);
        // 触发互动事件，并记录歌曲标题
    }

    function like() external onlyBadgeHolder {
        // 函数：点赞功能
        users[msg.sender].points += POINTS_PER_LIKE;
        // 增加用户积分
        emit Interacted(msg.sender, "like", POINTS_PER_LIKE);
        // 触发点赞互动事件
    }

    function donate() external payable onlyBadgeHolder nonReentrant {
        // 函数：向创作者捐赠，带防重入保护
        require(msg.value > 0, "Donation must be > 0");
        // 限制：捐赠金额必须大于 0
        
        // 计算获得积分：每 1 MON (1e18 wei) 获得 100 积分
        uint256 pointsEarned = (msg.value * POINTS_PER_DONATION_UNIT) / 1e18;
        
        users[msg.sender].points += pointsEarned;
        // 增加用户积分
        users[msg.sender].totalDonated += msg.value;
        // 记录累计捐赠总额
        
        // 将捐赠资金转发给创作者（合约所有者）
        (bool success, ) = payable(owner()).call{value: msg.value}("");
        require(success, "Transfer failed");
        // 检查转账是否成功
        
        emit Donated(msg.sender, msg.value, pointsEarned);
        // 触发捐赠事件
    }

    function createProposal(string calldata description, uint256 durationInDays) external {
        // 函数：创建治理提案
        if (msg.sender != owner()) {
            // 如果调用者不是所有者，则需检查勋章等级
            uint256 tokenId = badgeNFT.tokenOfOwnerByIndex(msg.sender, 0);
            // 获取调用者的第一个勋章 ID
            require(badgeNFT.badgeLevels(tokenId) >= 10, "Only owner or Legendary Fans can create proposals");
            // 限制：仅传奇粉丝（10级及以上）可以发起提案
        }
        
        proposalCount++;
        // 增加提案计数器
        Proposal storage p = proposals[proposalCount];
        // 指向新的提案存储槽
        p.description = description;
        // 设置提案内容
        p.endTime = block.timestamp + (durationInDays * 1 days);
        // 设置投票截止时间
        p.exists = true;
        // 激活提案状态
        
        emit ProposalCreated(proposalCount, description, p.endTime);
        // 触发提案创建事件
    }

    function vote(uint256 proposalId) external onlyBadgeHolder {
        // 函数：参与提案投票
        Proposal storage p = proposals[proposalId];
        // 获取指定提案
        require(p.exists, "Proposal does not exist");
        // 检查提案是否存在
        require(block.timestamp < p.endTime, "Voting ended");
        // 检查是否在投票时间内
        require(!p.hasVoted[msg.sender], "Already voted");
        // 限制：每个地址针对每个提案仅能投一次票

        uint256 tokenId = badgeNFT.tokenOfOwnerByIndex(msg.sender, 0);
        // 获取调用者的勋章 ID
        uint256 level = badgeNFT.badgeLevels(tokenId);
        // 获取勋章等级
        
        // 计算投票权重：权重 = 等级 + (当前积分 / 100)
        uint256 weight = level + (users[msg.sender].points / 100);
        
        p.voteCount += weight;
        // 累加提案总票数
        p.hasVoted[msg.sender] = true;
        // 记录该用户已投票
        
        emit Voted(proposalId, msg.sender, weight);
        // 触发投票事件
    }

    function hasVoted(uint256 proposalId, address user) external view returns (bool) {
        // 函数：查询指定用户是否已在某提案中投票
        return proposals[proposalId].hasVoted[user];
        // 返回布尔值
    }

    function getProposal(uint256 proposalId) external view returns (string memory description, uint256 voteCount, uint256 endTime, bool exists) {
        // 函数：获取提案的详细汇总信息
        Proposal storage p = proposals[proposalId];
        // 获取提案引用
        return (p.description, p.voteCount, p.endTime, p.exists);
        // 返回多个字段
    }

    function upgradeBadge() external onlyBadgeHolder {
        // 函数：消耗积分升级勋章
        uint256 tokenId = badgeNFT.tokenOfOwnerByIndex(msg.sender, 0);
        // 获取用户持有的勋章 ID
        uint256 currentLevel = badgeNFT.badgeLevels(tokenId);
        // 获取当前等级
        
        // 计算成本：成本 = 当前等级 * 基础系数 (50)
        uint256 cost = currentLevel * UPGRADE_COST_BASE;
        require(users[msg.sender].points >= cost, "Insufficient points");
        // 检查用户积分是否足够

        users[msg.sender].points -= cost;
        // 扣除积分
        badgeNFT.upgrade(tokenId);
        // 调用 NFT 合约执行升级逻辑
        
        emit PointsSpent(msg.sender, cost);
        // 触发积分消耗事件
    }

    function getPoints(address user) external view returns (uint256) {
        // 函数：查询指定用户的当前可用积分
        return users[user].points;
        // 返回积分值
    }
}
