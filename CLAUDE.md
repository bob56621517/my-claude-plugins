# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人 Claude Code 插件市场仓库。每个 MCP 工具独立为一个插件目录，平铺结构。



## 添加新插件

```bash
# 1. 创建插件目录
mkdir {plugin-name}/.claude-plugin/

# 2. 创建 plugin.json
cat > {plugin-name}/.claude-plugin/plugin.json <<'EOF'
{
  "name": "{plugin-name}",
  "description": "...",
  "author": { "name": "bob56621517" }
}
EOF

# 3. 创建 .mcp.json（仅 MCP 插件需要；纯 skill 插件跳过此步）
cat > {plugin-name}/.mcp.json <<'EOF'
{
  "{plugin-name}": {
    "command": "...",
    "args": [...]
  }
}
EOF

# 4. 在 marketplace.json 的 plugins[] 追加记录
# 5. 更新 README.md 插件目录表
```

## 常用命令

```bash
# 验证所有 JSON 文件合法性（仅校验存在的文件，避免 skill 插件误报）
for f in .claude-plugin/marketplace.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" || echo "$f FAIL"
done
for f in */.claude-plugin/plugin.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" || echo "$f FAIL"
done
for f in */.mcp.json; do
  [ -f "$f" ] && node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" || echo "$f FAIL"
done

# 检查有无遗漏注册（marketplace.json 中的插件是否都有对应目录）
node -e "
const m = require('./.claude-plugin/marketplace.json');
m.plugins.forEach(p => {
  const dir = p.source.replace(/^\\.\\//,'');
  const ok = require('fs').existsSync(dir + '/.claude-plugin/plugin.json');
  console.log(ok ? 'OK' : 'MISSING', p.name);
});
"
```

## 目录结构

```
{plugin-name}/                    # 每个插件一个独立目录
├── .claude-plugin/
│   └── plugin.json               # 元数据（name, description, author）
├── .mcp.json                     # MCP 运行配置（纯 MCP 插件；纯 skill 插件无此文件）
├── hooks/
│   ├── hooks.json                # Hook 注册配置（插件级，安装后自动生效）
│   └── *.ts                      # Hook 脚本，bun 执行
└── skills/{skill-name}/SKILL.md   # Skill 定义（纯 skill 插件；hybrid 插件可同时有 .mcp.json）
```

- `.claude-plugin/marketplace.json` — 市场注册清单，核心入口
- `preferences/skills/tool-preferences/SKILL.md` — 工具偏好 skill（非 MCP）
- `claude-md-management-cn/` — Hybrid 插件示例（skill + command，无 MCP）
- `unified-search/` — Hybrid 插件示例（MCP + hooks，捆绑多个 MCP 搜索后端）
- `README.md` — 安装指南 + 完整插件目录

## 插件开发规范

### Skill 插件可捆绑 MCP

纯 skill 插件也可以包含 `.mcp.json`，捆绑其依赖的 MCP 工具。例如 unified-search 捆绑 context7/wikidata/bocha-search，实现一次安装即用。

捆绑时 MCP 的 server key 需与独立插件的 `.mcp.json` 保持一致，这样 Claude Code v2.1.71+ 的去重机制（比较 URL/command+args）会自动抑制重复配置。

### 插件可声明 Hooks

插件可在 `hooks/hooks.json` 声明 hook，安装后自动注册。路径使用 `${CLAUDE_PLUGIN_ROOT}` 引用插件目录。例如 unified-search 注册 SessionStart hook：

```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "startup|clear",
      "hooks": [{
        "type": "command",
        "command": "bun",
        "args": ["${CLAUDE_PLUGIN_ROOT}/hooks/session-start.ts"]
      }]
    }]
  }
}
```

验证 hooks.json 合法性：
```bash
for f in */hooks/hooks.json; do
  [ -f "$f" ] && node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" && echo "$f OK" || echo "$f FAIL"
done
```

### 删除插件需清理三处

1. `git rm` 删除插件目录
2. `.claude-plugin/marketplace.json` 的 `plugins[]` 中移除条目
3. `README.md` — 表格行 + For AI 列表 + 环境变量表（如有）

## 约束

- 插件名（`plugin.json` 的 `name`）必须与目录名一致
- `marketplace.json` 的 `source` 格式为 `./{plugin-name}`
- 新增插件必须在 `marketplace.json` 注册，并在 `README.md` 添加表格行
- 远程 HTTP MCP 插件在上架前, 必须验证服务端实现了 Streamable HTTP 传输（SSE + Mcp-Session-Id）, 仅支持纯 JSON-RPC 的端点不可用
- **纯 skill 插件（无 MCP）不需要创建 `.mcp.json`**，只需 `plugin.json` + `skills/` 目录
