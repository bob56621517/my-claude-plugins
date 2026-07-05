---
name: marketplace-test
description: >-
  验证 my-claude-plugins 市场中所有（或指定）插件配置。当用户提到"测试市场"、"验证插件"、"跑测试"、"检查插件配置"、"验证 MCP"、"marketplace test"、"测试某个插件"时使用。支持 --plugin xx 指定单插件、--level L0/L1 指定层级。两层测试（L0 静态结构/L1 隔离环境测试），交互式收集环境变量。
---

# marketplace-test：插件市场验证

## 概述

对 my-claude-plugins 项目执行两层验证：

| 层级 | 验证内容 | 耗时 |
|------|---------|------|
| **L0** | JSON 合法性、marketplace ↔ 目录 ↔ README 交叉引用 | 秒级 |
| **L1** | 隔离目录 `claude plugin install` 验证完整安装与加载 | 30-60s/个 |

## 测试范围控制

根据用户意图决定测试范围：

| 模式 | 触发方式 | 说明 |
|------|---------|------|
| **全量测试** | 无参数，或 `--all` | 测试所有插件 |
| **指定插件** | `--plugin bocha-search` 或说出插件名 | 只测试单个插件 |
| **指定层级** | `--level L0` 或 "只测 L0" | 只跑指定层级 |

**示例用户表述**：
- "测试整个市场" → 全量
- "测一下 bocha" → 指定插件
- "只测 L0" → 指定层级
- "测一下 github 的 L1" → 指定插件 + 层级组合

## 前置条件

- 当前工作目录在 `my-claude-plugins` 项目根目录
- `claude` CLI 可用
- 可选：项目根目录 `.env.local` 文件（不提交 git）

## 已知插件与环境变量映射

所有需要环境变量的插件及其变量名。默认值存储在 `references/.env.local.example` 中，**不要在 SKILL.md 中硬编码凭证值**。

### 有默认值的变量

| 插件 | 环境变量 | 说明 |
|------|---------|------|
| bocha-search | BOCHA_API_KEY | 博查搜索 API Key |
| github | GITHUB_PERSONAL_ACCESS_TOKEN | GitHub Personal Access Token |
| gitee | GITEE_ACCESS_TOKEN | Gitee Access Token |
| gitlab | GITLAB_PERSONAL_ACCESS_TOKEN | GitLab Personal Access Token |
| gitlab | GITLAB_API_URL | GitLab 自托管实例 URL |

### 无默认值的变量

| 插件 | 环境变量 | 说明 |
|------|---------|------|
| postgres | POSTGRES_DB_URL | PostgreSQL 连接串 |
| redis | REDIS_URL | Redis 连接串 |
| sqlite | SQLITE_DB_PATH | SQLite 数据库文件路径 |
| filesystem | FILESYSTEM_ALLOWED_DIR | 允许操作的目录路径 |

### 无需环境变量的插件

context7, grep-app, wikidata, markitdown, markdown-formatter, image-optimizer, sequential-thinking, ast-grep, fetch, playwright, docker, server-memory, preferences（skill, 无 .mcp.json）

## 执行流程

### Step 0：收集环境变量（交互式）

**范围**：如果是指定插件测试，只收集该插件的环境变量；全量测试则收集所有插件的。

按以下顺序收集：

1. **source `.env.local`** — 如文件存在，先加载
2. **检查 shell 环境** — 对每个相关环境变量，检查是否已存在于当前 shell
3. **参考默认值** — 读取 `references/.env.local.example` 获取已知默认值
4. **以插件为单位，逐个询问用户**：

   对每个**缺环境变量**的插件，使用 AskUserQuestion 工具一次处理 1-2 个插件：

   **有默认值的变量** → 三个选项：
   - 使用默认值 ✅
   - 输入自定义值（选 Other 后输入）
   - 跳过该插件

   **无默认值的变量** → 两个选项：
   - 输入自定义值（选 Other 后输入）
   - 跳过该插件

   提示用户：跳过某个插件意味着 L1 不会测试该插件。

5. 将用户提供的值存入临时 map（如 `envMap`），在后续步骤中使用

### Step 1：L0 — 静态结构验证

在项目根目录运行以下验证，捕捉 stdout/stderr：

```bash
# 1. JSON 合法性校验
for f in */{.claude-plugin/plugin.json,.mcp.json} .claude-plugin/marketplace.json; do
  [ -f "$f" ] && node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" \
    && echo "OK: $f" || echo "FAIL: $f"
done

# 2. marketplace ↔ 目录交叉引用
node -e "
const m = require('./.claude-plugin/marketplace.json');
m.plugins.forEach(p => {
  const dir = p.source.replace(/^\.\\//,'');
  const ok = require('fs').existsSync(dir + '/.claude-plugin/plugin.json');
  console.log(ok ? 'OK' : 'MISSING', p.name, '→', dir);
});
"
```

**额外校验**：
- 插件目录名与 `plugin.json` 中 `name` 一致
- `marketplace.json` 中 `source` 格式为 `./{plugin-name}`
- 检查 `README.md` 插件数量是否与 `marketplace.json` 一致（grep 表格行数）
- `preferences` 插件无 `.mcp.json` 是预期的，标记为 N/A（skill 插件）

以 Markdown 表格输出结果。

### Step 2：L1 — 隔离环境混合验证

对每个有 `.mcp.json` 的插件执行。**跳过**用户在 Step 0 中跳过（因缺 env）的插件。

#### 2a. 准备隔离环境

```bash
TMPDIR=$(mktemp -d)
cd "$TMPDIR"

# 从本地项目路径添加市场（而非远程 URL），确保测试的是本地最新代码
# --scope project 在隔离目录的项目级别注册，不与用户全局配置冲突
claude plugin marketplace add "$PROJECT_ROOT" --scope project
```

#### 2b. 批量安装待测插件

将所有目标插件一次性安装：

```bash
for PLUGIN_NAME in plugin1 plugin2 plugin3; do
  claude plugin install "${PLUGIN_NAME}@my-claude-plugins" --scope project
done
```

#### 2c. 传输模式检查（精确）

`claude mcp list` 输出是机器格式，精确显示每个 MCP 的启动命令/URL，不依赖 LLM 判断：

```bash
claude mcp list 2>&1
# 示例输出：
#   plugin:gitee:gitee: bunx -y @gitee/mcp-gitee@latest - ✔ Connected   → stdio
#   plugin:github:github: https://api.githubcopilot.com/mcp/ - ✔ Connected → http
```

从此输出提取每个插件的传输模式（`bunx`/`uvx`/`npx`/`node` = stdio，`https://` = HTTP 远程）。

#### 2d. 功能调用测试（核心）

传输模式正确 ≠ 功能正常。启动独立 Claude 子进程，**实际调用**每个插件的 MCP 工具来验证功能。

**关键约束**：
- `--allowedTools` 不接受纯通配符，必须是 `mcp__<server>__*` 格式
- `--allowedTools` 是变长参数，会吞掉后续参数 → **用 stdin 传 prompt**，不要用命令行参数

```bash
# 对每个插件逐个测试：
# 1. 构造 allowedTools 模式（格式: mcp__plugin_{name}_{name}__*）
ALLOW_PATTERN="mcp__plugin_${PLUGIN_NAME}_${PLUGIN_NAME}__*"

# 2. 通过 stdin 传入测试 prompt（避免被 --allowedTools 吞掉）
TEST_MODEL="${TEST_MODEL:-haiku}"
printf '你是 MCP 插件测试员。测试 %s MCP 插件：调用最基础的只读操作（如 get/list/search），验证返回数据合理。只输出一行结论：✅/❌ + 调用的工具名 + 返回数据摘要' "$PLUGIN_NAME" \
  | ENV_VAR="$ENV_VAR" claude --model "$TEST_MODEL" --print --allowedTools "$ALLOW_PATTERN" 2>&1
```

**判断标准**：
- `install` 命令无错误退出 → 安装阶段 ✅
- `mcp list` 显示正确的传输模式（stdio 插件应显示 `bunx`/`uvx`/`npx`）→ 传输模式 ✅
- agent 返回 ✅ 且工具调用成功 → 功能正常 ✅
- agent 报错或工具调用失败 → ❌，需检查插件配置

#### 2e. 清理

```bash
cd "$PROJECT_ROOT"
rm -rf "$TMPDIR"
```

**模型选择**：
- 默认 `haiku`（轻量、快速、低成本，适合批量验证）
- 可通过环境变量 `TEST_MODEL` 覆盖：`TEST_MODEL=sonnet` 强制用更细致的模型

**注意**：
- skill 插件（如 preferences）无 `.mcp.json`，标记 N/A
- 缺 env 的插件在安装阶段就会失败——按用户选择处理
- 传输模式以 `claude mcp list` 输出为准（机器输出），agent 对模式的判断仅供参考
- agent 测试输出作为报告依据，关键信息需提取到 Step 3 汇总表中
- 若 agent 因某些原因未能完成测试（如 --allowedTools 格式错误、权限被拒绝），标注为 ⚠️ 并附原因
- **`--allowedTools` 与 prompt 的位置关系**：由于 `--allowedTools` 是变长参数，prompt 必须通过 stdin 传入，否则会被当作工具名消费

### Step 3：汇总报告

测试完成后，输出 Markdown 表格：

## 测试报告

### L0 静态结构
| 检查项 | 结果 | 详情 |
|--------|------|------|
| JSON 合法性 | ✅ 20/20 | ... |
| marketplace ↔ 目录 | ✅ 全部匹配 | ... |
| README 一致性 | ✅ / ⚠️ | ... |

### L1 隔离动态测试
| 插件 | Env | 结果 | 工具数 | 测试操作 | 备注 |
|------|-----|------|--------|---------|------|
| bocha-search | 已注入 | ✅ | 2 | bocha_web_search | - |
| github | 已注入 | ✅ | 30+ | search_repositories | - |
| gitee | 已注入 | ❌ | 0 | — | 远程 HTTP 而非期望的 stdio |
| context7 | - | ✅ | 2 | resolve-library-id | HTTP 远程 |
| preferences | - | N/A | - | - | skill 插件 |
