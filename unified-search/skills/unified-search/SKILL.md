---
name: unified-search
description: >-
  统一搜索路由，遇到需要联网搜索、查文档、查代码、查知识、查实时数据时触发。自动按流程拆分查询→路由→并行执行→单次降级→合并
---

## 统一查询原则

遇到需要联网搜索、查文档、查代码、查知识、查实时数据时，按以下流程执行：

### 流程
1. **拆分**：用户问题拆成多个 (方面, 关键词) 对，标注方面间的依赖关系
2. **路由**：每方面独立匹配 P1 工具（下表），P1 不可用/失败→降级 P2
3. **执行**：无依赖的方面并行发出。P1 失败（报错/空结果）→单次降级 P2。结果不满意→ AI 自行第二轮重查（不计降级）
4. **合并**：收集结果。有依赖的：先 A 拿结果→AI 判断 B 要不要查、怎么查

### 工具映射
- 库文档 / API / 版本迁移 → P1: Context7(resolve-library-id→query-docs) → P2: bocha_web_search
- 代码实现(开源示例/实现模式) → P1: grep-app(searchCode) → P2: GitHub search_code（如 github 插件已装）→ P3: bocha_web_search
- 已知缺陷(bug/issue/错误) → P1: GitHub search_issues/search_code（如 github 插件已装）/ bocha_web_search → P2: bocha_web_search
- 知识图谱(实体/属性/关系) → P1: Wikidata(search_items→get_statements→execute_sparql) → P2: bocha_web_search
- 天气/股票/汇率/新闻 → P1: bocha_ai_search → P2: bocha_web_search
- 中文网页 / 实时数据 → P1: bocha_web_search → P2: web_search
- 版本变更历史 → P1: GitHub search_commits（如 github 插件已装）/ bocha_web_search

### 约束
- 不总结
- URL / 网页内容抓取 → P1: mcp-server-fetch → P2: WebFetch（前者仅检查 robots.txt，无中心化域名白名单限制；后者受域名安全校验限制常失败）
- Wikidata 必须走 search→validate→SPARQL，不跳步
- bocha_ai_search 只对垂直领域（天气/新闻/股票/汇率）
- 不假设 MCP 必存——P1 工具不存在就降级 P2
