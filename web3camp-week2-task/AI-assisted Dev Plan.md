# Fan Badge 最小 Web3 原型

## 我要做的最小功能是什么？

做一个“积分兑换粉丝 Badge NFT”的最小功能，并加入“AI 动态生成专属 Badge”作为项目亮点。

用户连接钱包后，可以消耗 50 个积分兑换固定样式的普通 Badge；积分达到 100 分时，可以消耗 100 个积分，生成并铸造一枚 AI 专属 Badge NFT。铸造成功后，页面展示 Badge 图片、Token ID 和交易哈希。

AI 专属 Badge 会根据用户选择的音乐类型、颜色、情绪和关键词动态生成图片，并生成对应的 NFT 元数据。为了控制提示词质量和内容安全，本周优先使用有限选项加一个简短关键词，而不是完全开放的提示词输入框。

## 谁会使用它？

喜欢某位音乐人或创作者的粉丝。

第一阶段主要面向测试用户，用来验证“积分是否能够兑换成链上 Badge”这个核心流程。

## 技术方案

- 前端：Next.js、React、wagmi，负责连接钱包、查询积分和发起兑换交易。
- 后端：Python FastAPI，负责签到接口、重复签到校验、调用积分合约和记录交易结果。
- AI 服务：调用一种图像生成模型 API，根据用户选择的主题生成 Badge 图片。
- 数据库：Supabase，保存用户资料、签到记录、AI 生成任务、交易索引和 Badge 元数据。
- 文件存储：Supabase Storage，保存 AI 生成的 Badge 图片和元数据 JSON。
- 区块链：Solidity 智能合约，保存用户积分并铸造 ERC-721 Badge NFT。

链上数据是积分余额和 NFT 所有权的最终依据。Supabase 主要保存业务记录和查询索引，不能直接修改链上的积分或 NFT。

最小数据表：

- `users`：钱包地址、昵称和创建时间。
- `check_ins`：钱包地址、签到日期、获得积分和链上交易哈希。
- `redemptions`：钱包地址、Token ID、消耗积分和兑换交易哈希。
- `ai_badge_requests`：请求 ID、钱包地址、主题参数、消耗积分、生成状态、图片地址、元数据地址和交易哈希。

最小后端接口：

- `POST /api/check-ins`：检查用户当天是否已经签到，并向积分合约发放测试积分。
- `GET /api/users/{wallet_address}`：返回用户资料、积分和 Badge 信息。
- `POST /api/redemptions`：保存已经完成的兑换交易和 Token ID。
- `POST /api/ai-badges/generate`：验证用户已经消耗 100 积分的交易，创建 AI 生成任务并返回请求 ID。
- `GET /api/ai-badges/{request_id}`：查询 AI Badge 的生成和铸造状态。

AI Badge 最小流程：

1. 用户选择音乐类型、颜色、情绪和关键词。
2. 用户在钱包中确认交易，合约消耗 100 积分并产生 AI Badge 请求事件。
3. 前端把交易哈希和生成参数提交给 FastAPI。
4. FastAPI 通过 RPC 验证交易、钱包地址和积分消耗结果。
5. FastAPI 调用 AI 图像模型生成 Badge，并上传到 Supabase Storage。
6. FastAPI 创建 NFT 元数据，并通过具有铸造权限的测试钱包把 NFT 发给用户。
7. 页面轮询请求状态，最后展示图片、Token ID 和两笔交易哈希。

## 用户完成的一个动作是什么？

用户完成一次“使用积分生成 AI 专属 Badge”的操作：

1. 连接 MetaMask 钱包。
2. 查看积分是否达到 100 分。
3. 选择音乐类型、颜色、情绪并填写一个关键词。
4. 点击“生成 AI Badge”。
5. 在钱包中确认消耗 100 积分的交易。
6. 等待 AI 完成图片生成和 NFT 铸造。
7. 获得一枚具有独立图片和元数据的 Fan Badge NFT。

## 我需要读哪 1–3 个文档？

1. [OpenZeppelin ERC721 文档](https://docs.openzeppelin.com/contracts/5.x/erc721)：了解 `_safeMint`、`tokenURI` 和 NFT 所有权。
2. [Supabase Python 文档](https://supabase.com/docs/reference/python/introduction)：读写 AI 生成任务、用户和兑换记录，并使用 Storage 保存图片。
3. AI 图像生成 API 文档：了解提示词、图片生成、内容安全和图片文件返回方式，具体文档根据最终选用的模型服务确定。

## 本周真实实现什么？哪些可以 mock？

### 本周真实实现

- 一个积分合约或合约内的积分记录。
- 用户积分查询。
- 消耗积分兑换 Badge。
- ERC-721 Badge NFT 铸造。
- MetaMask 钱包连接。
- 前端兑换按钮和交易状态。
- 兑换成功后展示 Token ID 和交易哈希。
- 使用 FastAPI 实现签到、用户查询和兑换记录接口。
- 使用 Supabase 保存用户、签到和兑换记录。
- FastAPI 调用积分合约，为测试用户发放签到积分。
- 智能合约增加 AI Badge 的 100 积分兑换规则和请求事件。
- FastAPI 验证用户提交的积分消耗交易，避免只在前端判断积分。
- 接入一种真实的 AI 图像生成 API，生成至少一枚动态 Badge。
- 将 AI 图片和元数据保存到 Supabase Storage。
- 使用 FastAPI 测试钱包铸造 AI Badge NFT，并保存 Token ID 和交易哈希。
- 前端展示 AI 生成中的状态、失败状态和最终 Badge。
- 通过 FastAPI 自动生成的 `/docs` 页面测试后端接口。
- 部署到测试链并完成一次真实交易。

### 本周可以 mock

- 点赞、捐赠等积分来源：本周只真实实现签到积分，其他来源使用测试数据。
- 钱包签名登录：本周接口可以直接接收测试钱包地址，后续再加入签名验证。
- AI 提示词系统：本周使用固定模板拼接用户选择，不做复杂的提示词智能优化。
- AI 图片失败重试：本周可以由管理员手动重新触发，不做完整任务队列。
- NFT 元数据：本周使用固定 JSON 结构，只动态替换名称、描述、属性和图片地址。
- IPFS 上传：本周使用 Supabase Storage，后续再迁移到 IPFS 或 Arweave。
- 用户登录、排行榜、粉丝等级和社交功能。
- NFT 交易市场和转售功能。
- 后端自动监听链上事件：本周由前端在积分交易成功后，把交易哈希提交给 FastAPI。

## 我如何证明它做出来了？

完成一次可以验证的测试链操作：

1. 测试钱包原本有至少 100 积分。
2. 用户选择 Badge 主题并确认消耗 100 积分。
3. 交易成功后，链上积分减少 100。
4. 页面依次显示“验证交易”“AI 生成中”“铸造中”和“已完成”。
5. AI 生成的图片不是项目中预先写死的固定图片。
6. Supabase Storage 中可以查到动态生成的图片和元数据 JSON。
7. 钱包地址最终拥有一枚新的 AI Badge NFT。
8. NFT 的 `tokenURI` 可以读取到 AI 图片和动态属性。
9. 页面显示 Badge 图片、Token ID、积分交易哈希和铸造交易哈希。
10. 在区块浏览器中可以查到积分消耗交易、NFT 铸造交易和 NFT 所有者。
11. FastAPI `/docs` 可以成功调用 AI Badge 生成和状态查询接口。
12. Supabase 中可以查到对应的 AI 生成任务和兑换记录。

最终提交可以包含：

- 可运行的前端页面。
- 智能合约地址。
- 测试交易链接。
- GitHub 项目地址。
- 一段从连接钱包到兑换成功的演示视频。
