const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const FanBadgeNFT = await hre.ethers.getContractFactory("FanBadgeNFT");
  const nft = await FanBadgeNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("FanBadgeNFT deployed to:", nftAddress);

  const PointSystem = await hre.ethers.getContractFactory("PointSystem");
  const pointSystem = await PointSystem.deploy(nftAddress);
  await pointSystem.waitForDeployment();
  const pointSystemAddress = await pointSystem.getAddress();
  console.log("PointSystem deployed to:", pointSystemAddress);

  // Set point system address in NFT contract
  await nft.setPointSystem(pointSystemAddress);
  console.log("PointSystem address set in NFT contract");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
