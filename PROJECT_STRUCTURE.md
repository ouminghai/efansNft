# FanBadge DApp 项目目录结构说明

本文档旨在介绍 FanBadge DApp 的整体项目结构，帮助开发者快速了解各目录与文件的功能。

## 整体结构概览

```text
.
├── .trae/                      # Trae AI 相关配置与生成文档
│   └── documents/              # 产品需求文档 (PRD) 与技术架构设计
├── artifacts/                  # Hardhat 编译生成的合约产物 (ABI等)
├── contracts/                  # Solidity 智能合约源代码
│   ├── FanBadgeNFT.sol         # 动态 NFT 徽章合约
│   └── PointSystem.sol         # 积分与互动逻辑合约
├── scripts/                    # 自动化脚本
│   └── deploy.cjs              # 合约部署与初始化脚本
├── src/                        # 前端 React 源代码
│   ├── assets/                 # 静态资源文件 (图片、图标等)
│   ├── components/             # 可复用 UI 组件
│   │   ├── BadgeCard.tsx       # 徽章展示卡片
│   │   ├── InteractionBoard.tsx # 互动操作面板
│   │   ├── Navbar.tsx          # 导航栏
│   │   └── PointsDisplay.tsx   # 积分显示组件
│   ├── constants/              # 常量定义
│   │   └── abis.ts             # 合约 ABI 与地址配置
│   ├── hooks/                  # 自定义 React Hooks
│   ├── lib/                    # 通用工具库
│   ├── pages/                  # 页面组件
│   ├── App.tsx                 # 前端应用入口组件
│   ├── main.tsx                # 项目启动渲染脚本
│   └── index.css               # 全局样式配置 (Tailwind CSS)
├── test/                       # 智能合约单元测试
├── README.md                   # 项目快速入门指南
├── hardhat.config.cjs          # Hardhat 配置文件
├── package.json                # 项目依赖与脚本配置
├── tailwind.config.js          # Tailwind CSS 配置文件
└── tsconfig.json               # TypeScript 编译配置
```

## 核心目录详解

### 1. `contracts/`
包含所有部署在 Monad 区块链上的智能合约。
- **FanBadgeNFT.sol**: 核心身份载体，支持 SVG 链上渲染和动态元数据更新。
- **PointSystem.sol**: 驱动粉丝经济的核心逻辑，定义了各种互动行为的积分奖励。

### 2. `src/`
基于 Vite + React 搭建的前端应用。
- **components/**: 遵循单一职责原则拆分的 UI 模块。
- **constants/abis.ts**: 桥接前端与区块链的关键文件，存储了编译后的合约接口。

### 3. `.trae/documents/`
存储项目的设计蓝图。
- **prd.md**: 详细记录了产品的核心功能与设计愿景。
- **technical_architecture.md**: 定义了技术选型、路由和数据模型。

### 4. `scripts/`
用于简化开发流程。
- **deploy.cjs**: 一键部署合约到 Monad 测试网，并自动完成合约间的权限关联（如设置 NFT 合约的 PointSystem 地址）。
