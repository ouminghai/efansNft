// SPDX-License-Identifier: MIT
// 软件许可证声明，使用 MIT 许可证
pragma solidity ^0.8.24;
// 指定 Solidity 编译器版本为 0.8.24 或更高

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// 引入 OpenZeppelin 的标准 ERC721 实现
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// 引入 ERC721 可枚举扩展，支持查询持有者的所有代币
import "@openzeppelin/contracts/access/Ownable.sol";
// 引入所有权控制合约
import "@openzeppelin/contracts/utils/Strings.sol";
// 引入字符串工具库，用于 uint256 转字符串
import "@openzeppelin/contracts/utils/Base64.sol";
// 引入 Base64 工具库，用于处理元数据编码

contract FanBadgeNFT is ERC721, ERC721Enumerable, Ownable {
    // 定义 FanBadgeNFT 合约，继承 ERC721、可枚举扩展和所有权控制
    using Strings for uint256;
    // 为 uint256 类型启用 Strings 库函数

    uint256 private _nextTokenId;
    // 内部计数器，用于记录下一个要铸造的代币 ID
    mapping(uint256 => uint256) public badgeLevels;
    // 映射：代币 ID => 勋章等级
    mapping(uint256 => uint256) public mintTimestamps;
    // 映射：代币 ID => 铸造时间戳
    address public pointSystem;
    // 记录关联的积分系统合约地址

    event BadgeMinted(address indexed user, uint256 tokenId);
    // 事件：当新勋章被铸造时触发
    event BadgeUpgraded(uint256 indexed tokenId, uint256 newLevel);
    // 事件：当勋章等级提升时触发

    constructor() ERC721("Eason Fan Community Badge", "EASON") Ownable(msg.sender) {}
    // 构造函数：初始化代币名称为 "Eason Fan Community Badge"，符号为 "EASON"，设置合约所有者为部署者

    function setPointSystem(address _pointSystem) external onlyOwner {
        // 函数：设置积分系统地址，仅限合约所有者调用
        pointSystem = _pointSystem;
        // 更新积分系统地址
    }

    function mint() external {
        // 函数：铸造新勋章
        require(balanceOf(msg.sender) == 0, "Already has a badge");
        // 限制：每个地址只能持有一个勋章
        uint256 tokenId = _nextTokenId++;
        // 获取当前代币 ID 并递增计数器
        _safeMint(msg.sender, tokenId);
        // 安全铸造代币并发送给调用者
        badgeLevels[tokenId] = 1;
        // 初始等级设为 1
        mintTimestamps[tokenId] = block.timestamp;
        // 记录当前区块时间戳作为铸造时间
        emit BadgeMinted(msg.sender, tokenId);
        // 触发铸造事件
    }

    function upgrade(uint256 tokenId) external {
        // 函数：升级勋章等级
        require(msg.sender == pointSystem || msg.sender == owner(), "Not authorized");
        // 限制：仅允许积分系统或合约所有者调用升级
        badgeLevels[tokenId]++;
        // 增加勋章等级
        emit BadgeUpgraded(tokenId, badgeLevels[tokenId]);
        // 触发升级事件
    }

    function getRole(uint256 level) public pure returns (string memory) {
        // 函数：根据等级获取角色名称，纯函数
        if (level >= 10) return "Legendary Fan";
        // 10 级及以上：传奇粉丝
        if (level >= 7) return "Diamond Fan";
        // 7-9 级：钻石粉丝
        if (level >= 5) return "Platinum Fan";
        // 5-6 级：铂金粉丝
        if (level >= 3) return "Gold Fan";
        // 3-4 级：黄金粉丝
        return "Silver Fan";
        // 3 级以下：白银粉丝
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // 函数：获取代币的元数据 URI，重写 ERC721 标准函数
        _requireOwned(tokenId);
        // 检查代币是否存在
        uint256 level = badgeLevels[tokenId];
        // 获取当前等级
        string memory role = getRole(level);
        // 获取角色名称
        
        string memory name = string(abi.encodePacked("Eason Fan #", tokenId.toString()));
        // 拼接代币名称，如 "Eason Fan #0"
        string memory description = "Official Fan Badge for the Eason Music Community on Monad. This badge represents your unique identity and contribution to Eason's musical journey.";
        // 勋章描述信息
        string memory image = _generateImage(level, role);
        // 生成动态 SVG 图像内容

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', name, 
                        '", "description": "', description, 
                        '", "attributes": [',
                        '{"trait_type": "Creator", "value": "Eason Chan"},',
                        '{"trait_type": "Level", "value": ', level.toString(), '},',
                        '{"trait_type": "Role", "value": "', role, '"},',
                        '{"trait_type": "Join Date", "display_type": "date", "value": ', mintTimestamps[tokenId].toString(), '}',
                        '], "image": "data:image/svg+xml;base64,', Base64.encode(bytes(image)), '"}'
                    )
                )
            )
        );
        // 构建并 Base64 编码 JSON 元数据

        return string(abi.encodePacked("data:application/json;base64,", json));
        // 返回包含 Base64 数据的 data URI
    }

    function _generateImage(uint256 level, string memory role) internal pure returns (string memory) {
        // 内部函数：根据等级和角色生成动态 SVG 图像
        string memory color = level >= 10 ? "#EF4444" : (level >= 7 ? "#A855F7" : (level >= 5 ? "#F59E0B" : (level >= 3 ? "#3B82F6" : "#10B981")));
        // 根据等级选择背景主色调
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
                '<defs>',
                '<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:', color, ';stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#000000;stop-opacity:1" />',
                '</linearGradient>',
                '</defs>',
                '<rect width="100%" height="100%" rx="20" fill="url(#grad1)" />',
                '<rect x="10" y="10" width="330" height="330" rx="15" fill="none" stroke="white" stroke-width="1" stroke-opacity="0.2" />',
                '<text x="50%" y="25%" fill="white" font-family="sans-serif" font-weight="900" font-size="24" dominant-baseline="middle" text-anchor="middle" letter-spacing="2">EASON CHAN</text>',
                '<text x="50%" y="35%" fill="white" fill-opacity="0.6" font-family="sans-serif" font-size="12" dominant-baseline="middle" text-anchor="middle">FAN COMMUNITY PASS</text>',
                '<circle cx="50%" cy="58%" r="45" fill="white" fill-opacity="0.1" stroke="white" stroke-width="2" />',
                '<text x="50%" y="58%" fill="white" font-family="sans-serif" font-weight="900" font-size="42" dominant-baseline="middle" text-anchor="middle">', level.toString(), '</text>',
                '<text x="50%" y="78%" fill="white" font-family="sans-serif" font-weight="bold" font-size="18" dominant-baseline="middle" text-anchor="middle">', role, '</text>',
                '<path d="M 50 280 L 300 280" stroke="white" stroke-width="1" stroke-opacity="0.3" />',
                '<text x="50%" y="310%" fill="white" fill-opacity="0.5" font-family="monospace" font-size="10" dominant-baseline="middle" text-anchor="middle">MONAD TESTNET | VERIFIED FAN</text>',
                '</svg>'
            )
        );
        // 返回完整的 SVG 代码字符串
    }

    // 以下是 Solidity 要求的重写函数，用于解决多重继承的冲突。
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        // 内部函数：代币转移时的状态更新
        return super._update(to, tokenId, auth);
        // 调用父类的实现
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        // 内部函数：增加账户余额记录
        super._increaseBalance(account, value);
        // 调用父类的实现
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        // 函数：检查是否支持特定的接口 ID
        return super.supportsInterface(interfaceId);
        // 调用父类的实现
    }
}
