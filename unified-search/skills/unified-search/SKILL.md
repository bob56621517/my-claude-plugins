---
name: unified-search
description: 统一搜索路由技能。当用户提问需要联网搜索或查询外部知识时使用——分析问题类型，自动路由到最佳搜索后端（Context7 查文档/Wikidata 查知识图谱/博查查中文网页和实时数据/原生搜索兜底）。不做结果加工，不调用 WebFetch。
---

# 统一搜索路由（Unified Search）

分析用户问题类型，自动路由到最合适的搜索后端。不做结果加工，不调用 WebFetch。

> **捆绑 MCP**：本插件已捆绑 context7、wikidata、bocha-search 三个搜索 MCP。`claude plugin install unified-search@my-claude-plugins` 一次安装即具备完整搜索能力，无需单独安装其他搜索插件。

## 搜索后端概览

| 后端 | 定位 | 强项 | 弱项 |
|------|------|------|------|
| Context7 | 代码/库文档 | 版本特定的 API/库/SDK 官方文档和代码示例 | 只覆盖已索引的开源库，不覆盖通用网页 |
| Wikidata | 知识图谱 | 实体属性、关系、分类等结构化知识，SPARQL 推理 | 只覆盖已入库的结构化知识，不覆盖实时信息 |
| Bocha AI Search | 实时结构化数据 | 模态卡（天气/股票/汇率等），数据来自机器非 LLM | AI 总结可能不全或错误 |
| bocha_web_search | 中文网页搜索 | 中文搜索质量高、返回原始摘要、国内合规 | 需要 API Key |
| web_search | 英文网页兜底 | 零配置零延迟、服务端执行 | 仅 Anthropic 直连 API 可用；中文搜索弱 |

## 路由规则

如下依次判断，**从顶向下匹配**：

### P1：定向路由（分类明确 → 直接路由）

```
问题类型: API/库/SDK/框架 文档查询
判据: 提到具体库名/框架名 + 问用法/API/参数/配置/版本迁移
示例: "React Router v7 怎么用？"、"Express 中间件怎么写？"
路由: Context7（resolve-library-id + query-docs）
降级: 如果 Context7 工具不可用 → 走 P2 降级链
```

```
问题类型: 知识图谱/实体查询
判据: 问实体定义/属性/分类/关系，非实时性的事实查询
示例: "苏轼是哪个朝代的？"、"北京属于哪个国家？"
路由: Wikidata（search_items → get_statements/execute_sparql）
降级: 如果 Wikidata 工具不可用 → 走 P2 降级链
```

```
问题类型: 实时结构化数据
判据: 问天气/股票/汇率/火车票/航班等实时结构化信息
示例: "今天北京天气怎么样？"、"腾讯股价多少？"
路由: Bocha AI Search（bocha_ai_search）
降级: 如果 bocha_ai_search 不可用 → 走 P2 降级链
```

### P2：串行降级链（无法分类/不属于 P1 任何类型）

严格按顺序尝试，前一个不可用或结果不理想时才试下一个：

1. **bocha_web_search** — 中文+技术场景综合最优，返回原始摘要
   - 如果 `bocha_web_search` 工具不可用（未在 system prompt 中出现）→ 跳过，试下一个
2. **web_search** — Bocha 不可用时的降级，零配置零延迟
   - 如果 `web_search` 不可用 → 告知用户当前无可用的搜索后端

> P2 到此结束，不追加 WebFetch。

### 复合问题处理

当问题包含可分类 + 不可分类两方面时：

- **可分类方面** → 走对应的 P1 定向路由
- **不可分类方面** → 视为"无法分类"，走 P2 降级链
- **执行**：P1 和 P2 **并行发出**——不同方向的独立查询，互不依赖

示例："用 Next.js 15 的 App Router 写一个博客，需要查文档和参考现有实现"
- 可分类："Next.js 15 App Router 文档" → P1 路由到 Context7
- 不可分类："博客实现参考" → 走 P2（bocha_web_search → web_search）
- 执行：P1 和 P2 并行发出

## 不做什么（及理由）

| 不做 | 理由 |
|------|------|
| 不总结搜索结果 | 任何总结都是信息丢失，且浪费 token。路由完了模型自己会基于搜索结果推理 |
| 不调用 WebFetch | 搜索结果中的 URL，Claude 看到后会自动判断是否需要跟进 |
| 不做主动可用性探测 | 所有工具都在 system prompt 中声明，Claude 天然知道哪些可用。路由时直接检查工具是否在列表中即可 |
| 不做猜测性并行 | P2 严格串行，避免浪费——bocha_web_search 搜中文已经大概率够好 |
| 不因捆绑 MCP 而假设工具必存在 | 用户可能手动移除了某 MCP，降级逻辑已覆盖这种情况 |

## 工具映射

| 判据 | 工具 | 说明 |
|------|------|------|
| 库文档查询 | `resolve-library-id` + `query-docs` (Context7) | 先 resolve 再 query |
| 知识图谱实体 | `search_items` → `get_statements`/`execute_sparql` (Wikidata) | 先搜索再查语句或 SPARQL |
| 实时结构化数据 | `bocha_ai_search` (Bocha AI) | 仅用于模态卡场景 |
| P2 第一降级 | `bocha_web_search` (Bocha Web) | 中文搜索首选 |
| P2 最终兜底 | `web_search` (Anthropic 原生) | 零配置；Bocha 不可用时 |
