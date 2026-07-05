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

# 3. 创建 .mcp.json（MCP 插件）
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
# 验证所有 JSON 文件合法性
for f in */{.claude-plugin/plugin.json,.mcp.json} .claude-plugin/marketplace.json; do
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
{plugin-name}/                    # 每个 MCP 一个独立目录
├── .claude-plugin/
│   └── plugin.json               # 元数据（name, description, author）
└── .mcp.json                     # MCP 运行配置（无 MCP 的插件无此文件）
```

- `.claude-plugin/marketplace.json` — 市场注册清单，核心入口
- `preferences/skills/tool-preferences/SKILL.md` — 工具偏好 skill（非 MCP）
- `README.md` — 安装指南 + 完整插件目录

## 约束

- 插件名（`plugin.json` 的 `name`）必须与目录名一致
- `marketplace.json` 的 `source` 格式为 `./{plugin-name}`
- 新增插件必须在 `marketplace.json` 注册，并在 `README.md` 添加表格行
- 远程 HTTP MCP 插件在上架前, 必须验证服务端实现了 Streamable HTTP 传输（SSE + Mcp-Session-Id）, 仅支持纯 JSON-RPC 的端点不可用

