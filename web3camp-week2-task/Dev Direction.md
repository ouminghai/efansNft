# Dev 主方向选择说明

## 1. 我的主方向

我选择 **Dev（Web3 全栈开发）** 作为主方向。

我的重点是把智能合约、前端钱包交互、Python FastAPI 后端、Supabase 数据服务和 AI 图片生成能力连接起来，做出一个能够真实运行和演示的 Web3 产品原型。

## 2. 选择 Dev 的理由

第一，我已经完成了一个基于 Monad Testnet 的粉丝互动 DApp 初版，具备 Solidity 合约、React 前端、钱包连接和测试网部署经验。继续选择 Dev，可以在已有成果上深入，而不是重新从零开始。

第二，我更关注产品是否真正跑通。这个项目需要处理钱包连接、积分读取、链上交易、NFT 铸造、后端接口、数据存储和 AI 生成等多个环节，Dev 角色可以直接推动这些环节形成完整闭环。

第三，我希望进一步学习 Web3 全栈工程能力，包括合约权限控制、链上与链下数据边界、交易状态同步、后端验证链上交易，以及 AI 内容如何成为 NFT metadata 的一部分。

## 3. 我希望服务的问题

当前粉丝与创作者之间的互动通常分散在不同平台，签到、点赞、支持和活动参与很难形成统一、可验证的身份记录。传统平台积分也由平台单方面维护，用户无法确认积分规则和数字权益是否长期有效。

我希望解决的问题是：

- 让粉丝的签到、点赞和支持行为可以积累为透明的链上积分。
- 让积分不仅是页面中的数字，还能兑换成用户真正持有的 NFT Badge。
- 通过 AI 动态生成图片，让 Badge 能反映用户的音乐偏好、颜色、情绪和关键词，而不是所有用户获得同一张固定图片。
- 让创作者通过 Badge 等级和互动记录识别核心粉丝，为后续权益发放和社区活动提供依据。

项目的核心体验是：**粉丝互动获得积分，达到条件后消耗积分，生成并获得一枚专属的 AI Fan Badge NFT。**

## 4. 本周最小产出

本周计划完成一条可以实际演示的最小流程：

1. 用户连接 MetaMask，并在 Monad Testnet 上读取自己的积分。
2. 用户通过签到获得测试积分，同一个钱包每天只能签到一次。
3. 当积分达到 100 分时，用户可以选择音乐类型、颜色、情绪和一个关键词。
4. 用户确认消耗 100 积分，提交 AI Badge 生成请求。
5. FastAPI 验证积分交易，调用 AI 图像生成服务生成 Badge 图片。
6. 图片和 metadata JSON 保存到 Supabase Storage。
7. 后端将 AI Badge NFT 铸造给用户，并记录 Token ID 和交易哈希。
8. 前端展示生成状态、Badge 图片、Token ID 和区块浏览器链接。

本周最低验收标准：至少使用一个测试钱包，真实完成一次“获得积分 -> 消耗积分 -> AI 生成图片 -> 铸造 NFT -> 页面展示”的完整流程。

可以暂时 mock 的部分包括点赞、捐赠、排行榜、复杂 AI 提示词优化、自动事件监听、IPFS 上传和生产级钱包签名登录。本周优先保证核心流程可运行。

## 5. 参考资料

- [Monad 开发者文档](https://docs.monad.xyz/)：测试网、RPC、合约部署和区块浏览器配置。
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/5.x/)：ERC-721、权限控制、事件和安全合约组件。
- [wagmi React 文档](https://wagmi.sh/react/getting-started)：钱包连接、合约读取、交易提交和状态等待。
- [FastAPI 文档](https://fastapi.tiangolo.com/)：后端 API、请求校验和自动接口文档。
- [Supabase Python 文档](https://supabase.com/docs/reference/python/introduction)：数据库访问、生成任务记录和文件存储。
- AI 图像生成服务文档：图片生成、内容安全、返回文件处理和错误重试。

## 6. Week 3 角色

Week 3 我希望担任 **Dev / Web3 Full-stack Developer**。

我会负责：

- 设计和调整积分合约与 NFT 合约的接口、事件和权限。
- 完成合约部署、ABI 和前端配置。
- 使用 React、wagmi 和 viem 完成钱包及合约交互。
- 使用 Python FastAPI 开发签到、AI Badge 生成和状态查询接口。
- 使用 Supabase 保存用户、签到、生成任务、metadata 和交易索引。
- 联调 AI 图片生成、链上积分消耗和 NFT 铸造流程。
- 补充关键测试、错误状态、部署说明和演示材料。

在团队协作中，我会与 PM 确认最小功能范围，与 Designer 对齐 Badge 生成参数和交互状态，并向其他成员提供合约地址、接口说明、测试数据和可复现的运行步骤。

## 7. Week 3 完成证明

- 一个可以访问的前端页面。
- 一个可以通过 `/docs` 测试的 FastAPI 服务。
- Supabase 中可查询的签到、AI 生成和兑换记录。
- Monad Testnet 上可验证的积分交易与 NFT 铸造交易。
- 一枚由 AI 动态生成图片和 metadata 的 Fan Badge NFT。
- GitHub 中的源代码、README、合约地址和演示截图或视频。
