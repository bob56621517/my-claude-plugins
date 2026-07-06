# CLAUDE.md 管理插件（中文版）

CLAUDE.md 文件维护与改进工具——质量审计、捕获会话经验、保持项目记忆最新。

官方 [claude-md-management](https://github.com/anthropics/claude-code-plugins) 的中文翻译版。

## 功能

两个互补的工具，用于不同场景：

| | claude-md-improver-cn (skill) | /revise-claude-md-cn (command) |
|---|---|---|
| **用途** | 保持 CLAUDE.md 与代码库同步 | 捕获会话经验 |
| **触发方式** | 代码库变更 | 会话结束时 |
| **适用场景** | 定期维护 | 会话暴露了缺失的上下文 |

## 使用方法

### Skill: claude-md-improver-cn

审计 CLAUDE.md 文件，对照当前代码库状态进行评估：

```
"审计我的 CLAUDE.md 文件"
"检查 CLAUDE.md 是否是最新的"
```

### Command: /revise-claude-md-cn

捕获当前会话中的学习经验：

```
/revise-claude-md-cn
```

## 作者

基于 Anthropic 官方 [claude-md-management](https://github.com/anthropics/claude-code-plugins) 的中文翻译。

翻译与维护：bob56621517
