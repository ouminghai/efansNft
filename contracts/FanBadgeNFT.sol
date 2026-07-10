// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract FanBadgeNFT is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;
    mapping(uint256 => uint256) public badgeLevels;
    mapping(uint256 => uint256) public mintTimestamps;
    address public pointSystem;

    event BadgeMinted(address indexed user, uint256 tokenId);
    event BadgeUpgraded(uint256 indexed tokenId, uint256 newLevel);

    constructor() ERC721("Eason Fan Community Badge", "EASON") Ownable(msg.sender) {}

    function setPointSystem(address _pointSystem) external onlyOwner {
        pointSystem = _pointSystem;
    }

    function mint() external {
        require(balanceOf(msg.sender) == 0, "Already has a badge");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        badgeLevels[tokenId] = 1;
        mintTimestamps[tokenId] = block.timestamp;
        emit BadgeMinted(msg.sender, tokenId);
    }

    function upgrade(uint256 tokenId) external {
        require(msg.sender == pointSystem || msg.sender == owner(), "Not authorized");
        badgeLevels[tokenId]++;
        emit BadgeUpgraded(tokenId, badgeLevels[tokenId]);
    }

    function getRole(uint256 level) public pure returns (string memory) {
        if (level >= 10) return "Legendary Fan";
        if (level >= 7) return "Diamond Fan";
        if (level >= 5) return "Platinum Fan";
        if (level >= 3) return "Gold Fan";
        return "Silver Fan";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 level = badgeLevels[tokenId];
        string memory role = getRole(level);
        
        string memory name = string(abi.encodePacked("Eason Fan #", tokenId.toString()));
        string memory description = "Official Fan Badge for the Eason Music Community on Monad. This badge represents your unique identity and contribution to Eason's musical journey.";
        string memory image = _generateImage(level, role);

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

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _generateImage(uint256 level, string memory role) internal pure returns (string memory) {
        string memory color = level >= 10 ? "#EF4444" : (level >= 7 ? "#A855F7" : (level >= 5 ? "#F59E0B" : (level >= 3 ? "#3B82F6" : "#10B981")));
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
    }

    // The following functions are overrides required by Solidity.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
