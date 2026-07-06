---
description: 用本次会话的经验更新 CLAUDE.md
allowed-tools: Read, Edit, Glob
---

回顾本次会话，找出关于在此代码库中使用 Claude Code 的经验。更新 CLAUDE.md，添加有助于未来 Claude 会话更高效工作的上下文。

## 第1步：反思

哪些上下文缺失，导致 Claude 本可以更高效地工作？
- 使用或发现过的 Bash 命令
- 遵循的代码风格模式
- 有效的测试方法
- 环境/配置的坑
- 遇到的警告或陷阱

## 第2步：查找 CLAUDE.md 文件

```bash
find . -name "CLAUDE.md" -o -name ".claude.local.md" 2>/dev/null | head -20
```

决定每条新增内容属于哪个文件：
- `CLAUDE.md` — 团队共享（纳入 git 版本管理）
- `.claude.local.md` — 个人/本地专用（已 gitignore）

## 第3步：起草新增内容

**保持简洁**——每个概念一行。CLAUDE.md 是 prompt 的一部分，简洁至关重要。

格式：`<命令或模式>` — `<简要描述>`

避免：
- 冗长的解释
- 显而易见的信息
- 不太可能再次发生的一次性修复

## 第4步：展示建议的变更

对每条新增内容：

```
### 更新：./CLAUDE.md

**原因：**[一行理由]

\`\`\`diff
+ [新增内容——保持简洁]
\`\`\`
```

## 第5步：经确认后应用

询问用户是否要应用这些变更。只编辑用户批准的文件。
