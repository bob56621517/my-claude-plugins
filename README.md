# my-claude-plugins

bob56621517 的个人 Claude Code 插件市场。聚合常用 MCP 工具与偏好配置，支持一键安装。

## 添加市场

```bash
/plugin marketplace add https://github.com/bob56621517/my-claude-plugins
```

或通过项目级配置在 `settings.json` 中添加：

```json
"extraKnownMarketplaces": {
  "my-claude-plugins": {
    "source": {
      "source": "github",
      "repo": "bob56621517/my-claude-plugins"
    }
  }
}
```

## 可用插件

### 搜索与知识

| 插件 | 安装命令 | 功能 |
|------|---------|------|
| bocha-search | `/plugin install bocha-search@my-claude-plugins` | 中文搜索引擎 MCP，网页搜索 + AI 语义结构化卡片 [需要: BOCHA_API_KEY] |
| context7 | `/plugin install context7@my-claude-plugins` | 最新开源库/SDK 官方文档实时查询 |
| wikidata | `/plugin install wikidata@my-claude-plugins` | Wikidata 知识图谱——实体搜索、语句验证、SPARQL 查询 |
| unified-search | `/plugin install unified-search@my-claude-plugins` | 统一搜索路由——SessionStart hook 全局注入查询原则，捆绑 Context7/Wikidata/博查/GitHub/fetch（一次安装即具备完整搜索能力） |
| grep-app | `/plugin install grep-app@my-claude-plugins` | 跨数百万开源仓库的全文代码搜索 |

### 文档与媒体

| 插件 | 安装命令 | 功能 |
|------|---------|------|
| markitdown | `/plugin install markitdown@my-claude-plugins` | PDF/Word/Excel/PPT 转 Markdown |
| markdown-formatter | `/plugin install markdown-formatter@my-claude-plugins` | Markdown ↔ 22 种格式互转、修复与 lint |
| image-optimizer | `/plugin install image-optimizer@my-claude-plugins` | 图片压缩/裁剪/水印/智能裁剪/Favicon 生成 |

### 开发与 Git

| 插件 | 安装命令 | 功能 |
|------|---------|------|
| github | `/plugin install github@my-claude-plugins` | GitHub 仓库/PR/Issue/代码搜索/Release 全管理 |
| gitlab | `/plugin install gitlab@my-claude-plugins` | GitLab 仓库/Issue/MR/分支/CI Pipeline 全管理 |
| gitee | `/plugin install gitee@my-claude-plugins` | Gitee 仓库/Issue/PR/通知/Release 全管理 |
| git-context-prep | `/plugin install git-context-prep@my-claude-plugins` | Git 上下文准备——开始/继续议题时自动检测分支、同步远程、切换议题（纯 Skill，零依赖） |
| ast-grep | `/plugin install ast-grep@my-claude-plugins` | AST 结构化代码搜索与替换，支持 26 种语言 |
| docker | `/plugin install docker@my-claude-plugins` | Docker 容器/镜像/Compose 管理 |

### 交互与工具

| 插件 | 安装命令 | 功能 |
|------|---------|------|
| fetch | `/plugin install fetch@my-claude-plugins` | HTTP 请求调试 REST API |
| playwright | `/plugin install playwright@my-claude-plugins` | 无头浏览器截图/E2E/SPA 交互 |
| sequential-thinking | `/plugin install sequential-thinking@my-claude-plugins` | 多步结构化推理，可修正回溯 |

### 项目级数据库与存储

| 插件 | 安装命令 | 功能 |
|------|---------|------|
| postgres | `/plugin install postgres@my-claude-plugins` | PostgreSQL 数据库读写和 Schema 查询 |
| redis | `/plugin install redis@my-claude-plugins` | Redis 缓存读写和 Key 扫描 |
| sqlite | `/plugin install sqlite@my-claude-plugins` | SQLite 轻量数据库读写 |
| filesystem | `/plugin install filesystem@my-claude-plugins` | 限定目录文件读写遍历 |
| server-memory | `/plugin install server-memory@my-claude-plugins` | 知识图谱持久化跨会话记忆 |

### 工具偏好

| 插件 | 安装命令 | 功能 |
|------|---------|------|
| preferences | `/plugin install preferences@my-claude-plugins` | 工具链偏好设置（uvx/bun/mvn/gh/glab） |

### 项目管理

| 插件 | 安装命令 | 功能 |
|------|---------|------|
| superpowers-zh | `/plugin install superpowers-zh@my-claude-plugins` | AI 编程超能力中文增强版：20 个 skills，含中文代码审查/提交规范/文档/Git 工作流 + 调试/测试/规划等 |
| mattpocock-skills | `/plugin install mattpocock-skills@my-claude-plugins` | Matt Pocock's skills：grilling、TDD、code review、domain modelling、spec/ticket 流程等 22 个技能 |
| claude-md-management-cn | `/plugin install claude-md-management-cn@my-claude-plugins` | CLAUDE.md 质量审计/会话经验捕获/记忆优化（官方中文版） |

## For AI

以下插件列表为 AI 提供可安装的工具目录，供自动决策使用：

- `unified-search` — 统一搜索路由，SessionStart hook 全局注入查询原则，捆绑 Context7/Wikidata/博查/GitHub/fetch MCP 一次安装即用
- `bocha-search` — 中文搜索引擎，支持网页搜索和 AI 语义结构化卡片 [需要 BOCHA_API_KEY]
- `context7` — 最新开源库/SDK 官方文档实时查询
- `wikidata` — Wikidata 知识图谱——实体搜索、语句验证、SPARQL 查询
- `grep-app` — 跨数百万开源仓库的全文代码搜索
- `markitdown` — PDF/Word/Excel/PPT 转 Markdown
- `markdown-formatter` — Markdown 与 22 种格式互转、修复与 lint
- `image-optimizer` — 图片压缩、裁剪、水印、智能裁剪、Favicon 生成
- `github` — GitHub 仓库/PR/Issue/代码搜索/Release 管理
- `gitlab` — GitLab 仓库/Issue/MR/分支/CI Pipeline 管理
- `gitee` — Gitee 仓库/Issue/PR/通知/Release 管理
- `git-context-prep` — Git 上下文准备，开始/继续议题时自动检测分支、同步远程、切换议题
- `ast-grep` — AST 结构化代码搜索与替换，26 种语言
- `docker` — Docker 容器/镜像/Compose 管理
- `fetch` — HTTP 请求与 REST API 调试
- `playwright` — 无头浏览器截图、E2E 测试、SPA 交互
- `sequential-thinking` — 多步结构化推理，可回溯修正
- `postgres` — PostgreSQL 数据库读写与 Schema 查询（项目级）
- `redis` — Redis 缓存读写与 Key 扫描（项目级）
- `sqlite` — SQLite 轻量数据库读写（项目级）
- `filesystem` — 限定目录文件读写遍历（项目级）
- `server-memory` — 知识图谱持久化跨会话记忆（项目级）
- `preferences` — 工具链偏好设置：Python→uvx, JS/TS→bun, Java→mvn, GitHub→gh, GitLab→glab
- `superpowers-zh` — AI 编程超能力中文增强版：20 个 skills，中文代码审查/提交规范/文档/Git 工作流 + 调试/测试/规划
- `mattpocock-skills` — Matt Pocock 的工程技能包：grilling、TDD、code review、domain modelling、spec/ticket 流程等
- `claude-md-management-cn` — CLAUDE.md 质量审计、会话经验捕获、项目记忆优化（官方中文版）

## 环境变量

以下环境变量需要根据实际配置设置：

| 变量 | 用途 | 所属插件 |
|------|------|---------|
| `BOCHA_API_KEY` | 博查搜索 API Key | unified-search, bocha-search |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub 个人访问令牌 | github |
| `GITLAB_PERSONAL_ACCESS_TOKEN` | GitLab 个人访问令牌 | gitlab |
| `GITLAB_API_URL` | GitLab 自托管实例地址 | gitlab |
| `GITEE_ACCESS_TOKEN` | Gitee 个人访问令牌 | gitee |
| `POSTGRES_DB_URL` | PostgreSQL 数据库连接 URL | postgres |
| `REDIS_URL` | Redis 连接 URL | redis |
| `SQLITE_DB_PATH` | SQLite 数据库文件路径 | sqlite |
| `FILESYSTEM_ALLOWED_DIR` | 文件系统允许访问的目录 | filesystem |

## 安装示例

添加市场后一键安装常用工具：

```bash
# 搜索相关
/plugin install unified-search@my-claude-plugins

# 文档相关
/plugin install markitdown@my-claude-plugins
/plugin install markdown-formatter@my-claude-plugins

# 开发相关（按需选择 git 工具）
/plugin install github@my-claude-plugins
/plugin install ast-grep@my-claude-plugins

# 工具偏好
/plugin install preferences@my-claude-plugins

# 验证安装
/plugin list
```
