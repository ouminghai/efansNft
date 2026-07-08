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

### 4. 部署到 Vercel
项目当前使用 Next.js，已包含 [vercel.json](/Users/ouminghai/Library/Mobile%20Documents/com~apple~CloudDocs/code/web3intern/efansNft/vercel.json:1)，默认使用以下配置:

```bash
Framework: Next.js
Install Command: npm install
```

部署步骤:
```bash
1. 将项目推送到 GitHub
2. 在 Vercel 中导入仓库
3. 确认构建配置为 Vite
4. 在 Vercel 环境变量中添加 VITE_WALLETCONNECT_PROJECT_ID
5. 点击 Deploy
```

如果你本地想先验证一次构建:
```bash
npm run check
npm run build
```

## 项目结构
- `contracts/`: Solidity 智能合约
- `src/components/`: React UI 组件
- `src/constants/abis.ts`: 合约 ABI 与地址配置
- `scripts/`: 部署脚本

## 注意事项
- 部署后，请务必更新 `src/constants/abis.ts` 中的合约地址。
- Monad RPC 目前使用的是 `https://rpc-devnet.monadinfra.com`，请根据最新的测试网文档进行调整。
- Vercel 线上环境如需 WalletConnect，请配置 `VITE_WALLETCONNECT_PROJECT_ID`。
- 上线前请确认钱包网络为 Monad Testnet，并验证 `FAN_BADGE_NFT_ADDRESS` 与 `POINT_SYSTEM_ADDRESS` 已替换为真实部署地址。
- Next.js 版本请使用 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 作为 WalletConnect 配置。
