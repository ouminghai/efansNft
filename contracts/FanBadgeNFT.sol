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
    address public pointSystem;

    event BadgeMinted(address indexed user, uint256 tokenId);
    event BadgeUpgraded(uint256 indexed tokenId, uint256 newLevel);

    constructor() ERC721("Monad Fan Badge", "MFB") Ownable(msg.sender) {}

    function setPointSystem(address _pointSystem) external onlyOwner {
        pointSystem = _pointSystem;
    }

    function mint() external {
        require(balanceOf(msg.sender) == 0, "Already has a badge");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        badgeLevels[tokenId] = 1;
        emit BadgeMinted(msg.sender, tokenId);
    }

    function upgrade(uint256 tokenId) external {
        require(msg.sender == pointSystem || msg.sender == owner(), "Not authorized");
        badgeLevels[tokenId]++;
        emit BadgeUpgraded(tokenId, badgeLevels[tokenId]);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        uint256 level = badgeLevels[tokenId];
        
        string memory name = string(abi.encodePacked("Monad Fan Badge #", tokenId.toString()));
        string memory description = "A dynamic NFT representing your loyalty in the Monad ecosystem.";
        string memory image = _generateImage(level);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', name, 
                        '", "description": "', description, 
                        '", "attributes": [{"trait_type": "Level", "value": ', level.toString(), 
                        '}], "image": "data:image/svg+xml;base64,', Base64.encode(bytes(image)), '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _generateImage(uint256 level) internal pure returns (string memory) {
        string memory color = level > 5 ? "#A855F7" : (level > 2 ? "#06B6D4" : "#64748B");
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350">',
                '<style>.base { fill: white; font-family: serif; font-size: 24px; }</style>',
                '<rect width="100%" height="100%" fill="', color, '" />',
                '<text x="50%" y="40%" class="base" dominant-baseline="middle" text-anchor="middle">Monad Fan</text>',
                '<text x="50%" y="60%" class="base" dominant-baseline="middle" text-anchor="middle">Level ', level.toString(), '</text>',
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
