# FanBadge DApp

这是一个基于 Monad 区块链构建的高频互动粉丝生态 DApp。

## 核心特性
- **动态 NFT 徽章**: 徽章外观和元数据随等级提升而动态变化。
- **高频互动积分**: 签到、点赞、投票等操作均在链上记录并产生积分。
- **Monad 优化**: 利用 Monad 的高吞吐量实现流畅的链上交互。

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 智能合约开发
编译合约:
```bash
npx hardhat compile
```

部署合约 (需要配置环境变量 `PRIVATE_KEY`):
```bash
npx hardhat run scripts/deploy.cjs --network monadTestnet
```

### 3. 前端开发
启动开发服务器:
```bash
npm run dev
```

## 项目结构
- `contracts/`: Solidity 智能合约
- `src/components/`: React UI 组件
- `src/constants/abis.ts`: 合约 ABI 与地址配置
- `scripts/`: 部署脚本

## 注意事项
- 部署后，请务必更新 `src/constants/abis.ts` 中的合约地址。
- Monad RPC 目前使用的是 `https://rpc-devnet.monadinfra.com`，请根据最新的测试网文档进行调整。
