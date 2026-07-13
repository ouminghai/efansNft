# Moss 学习笔记：Web3 AI Agent 的安全交易框架

## 1. 项目简介

Moss 是一个面向 Web3 AI Agent 的交易安全框架。它不是 AI 模型，也不是一个完整的 AI Agent 产品，而是 Agent 在需要构建链上交易时使用的工具层。

它的核心作用是：让 AI Agent 不直接手写 ABI、calldata、合约地址和复杂交易逻辑，而是通过标准流程生成交易计划，并在用户签名前完成模拟和安全检查。

Moss 当前主要围绕 Monad 生态和 MCP 工具调用展开。它强调一件事：Moss 只构建和验证交易，不替用户签名，也不替用户发送交易。最终签名动作仍然应该发生在用户自己的钱包里。

可以把 Moss 放在这个位置理解：

```text
用户自然语言
   ↓
AI Agent / 产品业务逻辑
   ↓
Moss MCP Server
   ↓
协议适配器
   ↓
生成交易 Plan + 模拟验证
   ↓
用户钱包确认签名
   ↓
区块链执行交易
```

## 2. Moss 为什么存在

Web3 交易对 AI Agent 来说非常危险。

一个看起来简单的用户请求，例如：

```text
帮我把 1 MON 换成 USDC
```

背后可能涉及很多细节：

- 使用哪个 router
- 输入 token 和输出 token 是否正确
- native token 是否需要 wrap
- token decimals 是否正确
- 最小收到数量是否合理
- 滑点如何设置
- 是否需要 approve
- approve 给谁
- 是否出现额外资产转出
- NFT 是否被意外转走
- calldata 是否被篡改

如果 AI Agent 直接靠 ABI 和用户语言自己拼交易，只要错一点点，就可能导致真实资产损失。

Moss 的判断是：AI Agent 不应该直接手搓底层链上交易。Agent 应该表达用户意图，由经过适配的协议能力生成交易计划，再通过模拟结果检查这笔交易是否真的符合预期。

## 3. Moss 解决的核心问题

### 3.1 Agent 不应该直接拼 calldata

普通 LLM 很擅长理解语言，但不适合独立处理链上交易的底层细节，例如：

- ABI 参数顺序
- token 地址
- decimals 换算
- approve 对象
- multicall 组合
- native token wrap / unwrap
- ERC-721 / ERC-1155 授权语义

Moss 通过协议适配器把这些细节封装起来，让 Agent 使用更高层的能力。

### 3.2 交易必须可解释、可模拟、可检查

Moss 不希望 Agent 直接给用户一个钱包弹窗，而是要求先形成交易 Plan。

Plan 里会记录：

- 用户意图
- 要执行的未签名交易
- 预期资产流动
- 预期授权变化
- 预期 NFT 变化
- 风险标签
- 防篡改 hash

这样 Agent 和用户可以在签名前知道：这笔交易到底会做什么。

### 3.3 模拟结果必须和声明一致

Moss 的关键设计是 `expects`。它相当于交易计划里的安全合同。

它会声明：

- 用户最多会付出什么资产
- 用户最少会收到什么资产
- 是否允许授权
- 授权对象是谁
- 授权额度是多少
- NFT 是否允许移动

Moss 会用真实链上状态模拟交易，然后把模拟结果和 `expects` 对比。如果出现不一致，就产生 warning。

### 3.4 有 warning 就停止

Moss 的安全规则很明确：只要模拟结果出现 warning，Agent 就不能继续把交易交给用户签名。

warning 不是普通提示，而是停止信号。

Agent 可以向用户解释风险，但不应该继续执行危险交易。

## 4. 核心流程

Moss 的标准流程是：

```text
discover -> load -> action -> simulate
```

### 4.1 discover

发现当前上下文里有哪些可用能力。

例如：

- swap
- wrap
- unwrap
- transfer
- approve
- mint
- claim
- supply
- withdraw
- NFT transfer

### 4.2 load

加载某个能力的详细信息，包括需要哪些参数、支持哪些资产、风险标签是什么。

### 4.3 action

根据用户意图和参数生成交易 Plan。

这一步生成的是未签名交易，不会直接发送到链上。

### 4.4 simulate

模拟执行 Plan，并检查实际效果是否符合 Plan 的声明。

模拟会关注：

- ERC-20 转入转出
- 原生 token 转入转出
- ERC-721 / ERC-1155 NFT 变化
- approve / setApprovalForAll 授权变化
- 交易是否回滚
- Plan 是否被篡改
- 是否出现未声明资产流动

## 5. Moss 不是 AI Agent，而是写 Agent 时用到的框架

这一点很重要。

Moss 本身不是大模型，也不是聊天机器人。它不会独立理解用户完整需求，也不会替你设计产品流程。

更准确的关系是：

```text
AI 模型：理解自然语言
Agent：拆解任务、做决策、调用工具
Moss：帮助 Agent 安全构建和模拟链上交易
钱包：用户确认并签名
区块链：真正执行交易
```

所以，如果我要自己开发一个 AI 产品，可以在产品中使用 Moss，但不是用 Moss 替代 AI 模型。

## 6. 一般开发产品时什么时候使用 Moss

适合使用 Moss 的情况：

- 产品里有 AI Agent
- Agent 会根据用户自然语言发起链上操作
- 操作涉及真实资产、NFT、授权或 DeFi 交互
- 需要在签名前模拟交易风险
- 需要防止 Agent 生成错误交易

例如：

- AI 钱包助手
- DeFi 自动操作 Agent
- NFT 领取 / 转让 / 授权助手
- 创作者粉丝权益 Agent
- GameFi 资产操作助手
- DAO 治理和奖励领取助手

不一定需要 Moss 的情况：

- 只是普通 DApp 前端按钮
- 合约调用路径固定
- 没有 AI Agent 参与决策
- 用户明确点击固定 mint / claim / transfer 按钮

普通 DApp 可以直接使用 wagmi、viem、ethers 等工具调用合约。Moss 的强项是 AI Agent 场景里的安全交易生成和模拟。

## 7. 与 eFans NFT 粉丝平台的关系

当前 eFans NFT / Fan Badge 项目是一个基于 Monad 的粉丝互动 NFT 平台，核心方向包括：

- 用户连接钱包
- 用户通过互动获得积分
- 用户达到积分门槛后兑换 Badge NFT
- NFT Badge 代表粉丝身份或等级
- 后续可能增加 AI 生成专属 Badge

如果项目只是普通网页按钮式交互，Moss 不是必须依赖。

例如：

```text
用户点击签到 -> 获得积分
用户点击兑换 -> mint Badge NFT
```

这类固定流程可以直接由前端调用智能合约完成。

但是，如果 eFans NFT 未来加入 AI 助手，Moss 就会变得有价值。

例如用户对 AI 助手说：

```text
帮我领取 Alice 创作者的粉丝 NFT
```

Agent 需要判断：

- 用户是否满足领取条件
- 领取是否需要支付费用
- NFT 是否 mint 给用户本人
- 是否有额外授权
- 是否有 NFT 被意外转走
- 是否有隐藏资产转出

这时 Moss 可以作为交易安全层，帮助 Agent 先生成 Plan，再模拟验证，最后再让用户签名。

## 8. eFans NFT 可以如何结合 Moss

如果后续要把 eFans NFT 做成带 AI Agent 的产品，可以设计这样的架构：

```text
用户：
“帮我领取 Alice 的粉丝 Badge”

eFans AI Agent：
理解用户想领取 Alice 的粉丝 NFT

Moss：
调用 claimFanBadge 能力，生成交易 Plan

simulate：
检查用户会付出什么、收到什么、是否有额外授权

用户钱包：
用户确认并签名

FanBadgeNFT 合约：
执行 mint / claim
```

可以为 eFans NFT 封装的能力包括：

| eFans NFT 功能 | Moss 能力名称示例 | 用途 |
|---|---|---|
| 兑换粉丝 Badge | `claimFanBadge` | 用户用积分或条件领取 NFT |
| 铸造 AI Badge | `mintAIBadge` | 用户达到门槛后 mint AI 生成 Badge |
| 转让 Badge | `transferFanBadge` | 用户转移自己的粉丝 NFT |
| 创作者空投 | `airdropFanBadge` | 创作者给粉丝批量发 NFT |
| 升级等级 | `upgradeFanTier` | 根据积分或权益升级 Badge |
| 领取奖励 | `claimFanReward` | 粉丝领取 token、积分或权益 |
| 撤销授权 | `revokeApproval` | 帮用户撤销危险 NFT 授权 |

## 9. NFT 粉丝平台特别需要关注的安全点

Moss 的安全思想对 NFT 项目很有参考价值，即使暂时不接入 Moss，也可以借鉴这些检查。

### 9.1 Mint 价格

用户以为是免费领取 NFT，但交易里实际支付了费用，就应该明确提醒或阻止。

### 9.2 Recipient 地址

NFT 应该 mint 给用户本人，还是 mint 给其他地址？这个必须清楚展示。

### 9.3 Collection 地址

用户领取的是不是正确的 FanBadgeNFT 合约，而不是假冒 collection。

### 9.4 Token ID

如果涉及具体 tokenId，需要确认转移或升级的是用户想操作的那个 NFT。

### 9.5 NFT 授权

特别要关注：

```solidity
setApprovalForAll(operator, true)
```

这类授权可能允许 operator 移动用户整个 collection 的 NFT。对普通用户来说，这是非常高风险操作。

### 9.6 额外资产转出

领取 NFT 的交易不应该意外转走用户的钱包资产、其他 token 或其他 NFT。

### 9.7 批量空投

创作者批量空投时，要检查：

- 地址列表是否正确
- 数量是否正确
- 是否重复发放
- 是否发给错误地址
- gas 和执行失败如何处理

## 10. 示例用例：AI 帮用户领取粉丝 NFT

用户输入：

```text
帮我领取 Alice 的粉丝 NFT
```

Agent 理解意图：

```text
用户想领取 Alice 创作者对应的 Fan Badge NFT
```

Moss 调用流程：

```text
1. discover：查找是否有 claimFanBadge 能力
2. load：加载 claimFanBadge 需要的参数
3. action：生成领取 NFT 的交易 Plan
4. simulate：模拟交易结果
```

模拟结果如果安全：

```text
你将支付 0.01 MON
你将收到 1 个 Alice Fan Badge NFT
NFT 会发送到你的钱包地址
没有额外 token 转出
没有 setApprovalForAll 授权
没有 warning
```

然后 Agent 才能让用户确认：

```text
是否继续并打开钱包签名？
```

如果模拟结果有 warning：

```text
这笔交易存在风险：它会给未知地址授予 NFT 操作权限。
为了安全，我不会继续发起签名。
```

## 11. 伪代码理解

下面是帮助理解的伪代码，不是 Moss 的完整真实 SDK 代码：

```ts
const userMessage = "帮我领取 Alice 的粉丝 NFT";

const intent = {
  verb: "claimFanBadge",
  creator: "Alice",
  account: userAddress,
};

const capabilities = await moss.discover({
  chainId: 10143,
  account: userAddress,
});

const claimCapability = capabilities.find(
  (cap) => cap.verb === "claimFanBadge"
);

const schema = await moss.load({
  capability: claimCapability.id,
});

const plan = await moss.action({
  capability: claimCapability.id,
  params: {
    creatorId: "alice",
    recipient: userAddress,
  },
});

const simulation = await moss.simulate({
  plans: [plan],
  account: userAddress,
});

if (simulation.warnings.length > 0) {
  throw new Error("交易模拟存在风险，停止执行");
}

showTransactionSummary(simulation);

await walletClient.sendTransaction(plan.txs[0]);
```

## 12. 我的理解

Moss 的核心价值不是让 AI Agent 更自由地交易，而是让 Agent 在受约束、可验证、可模拟的边界内交易。

Web3 Agent 最大的风险不是不会操作，而是太容易在用户没看懂的情况下操作真实资产。Moss 把链上交易拆成：

```text
用户意图 -> 能力发现 -> 交易计划 -> 模拟验证 -> 用户确认
```

这套流程对 eFans NFT 也有启发。

未来如果 eFans NFT 只是普通 DApp，可以先不接入 Moss。但如果要做 AI 助手，让用户通过自然语言领取 NFT、升级 Badge、领取奖励、转让资产或撤销授权，那么 Moss 这种框架就很适合作为安全交易层。

对当前项目最有用的学习点是：

- 不要让 AI 直接拼链上交易
- 不要跳过模拟
- 不要忽略授权风险
- 不要让用户签看不懂的交易
- 每次链上操作都应该说明用户付出什么、收到什么、授权了什么

## 13. 参考链接

- [Moss GitHub README](https://github.com/nishuzumi/moss)
- [Getting Started](https://github.com/nishuzumi/moss/blob/main/docs/getting-started.md)
- [MCP Tools Reference](https://github.com/nishuzumi/moss/blob/main/docs/mcp-tools.md)
- [Agent Skill Guide](https://github.com/nishuzumi/moss/blob/main/docs/agent-skill.md)
- [Security](https://github.com/nishuzumi/moss/blob/main/SECURITY.md)
- [Project Context / Glossary](https://github.com/nishuzumi/moss/blob/main/CONTEXT.md)
- [Example: Agent Swap](https://github.com/nishuzumi/moss/tree/main/examples/agent-swap)
- [ADR: Decorator Authoring Model](https://github.com/nishuzumi/moss/blob/main/docs/adr/0001-decorator-authoring-model.md)
- [ADR: Curated Token Catalog](https://github.com/nishuzumi/moss/blob/main/docs/adr/0005-curated-token-catalog.md)
- [ADR: ERC Interface Layer and Composition](https://github.com/nishuzumi/moss/blob/main/docs/adr/0009-erc-interface-layer-and-composition.md)
