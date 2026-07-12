---
name: git-workflow
description: >-
  涉及 git 操作时使用: 议题/issue (含 #N)、提交/commit/push、PR/MR。
  也适用于用户讨论或开始某个议题时。
---

## 平台检测

1. git fetch origin
2. git status -sb
3. git branch -vv
4. git remote get-url origin → 判平台

## 工具优先级

git能做必用 > 平台MCP(补不足) > gh/glab

## 命名规则

| 对象 | 格式 | 示例 |
|------|------|------|
| 常规分支 | `{议题号}-{类型}-{描述}` | `15-feature-git-workflow-fix` |
| 临时分支 | `{当前分支}_temp_{date}` | `15-feature-git-workflow-fix_temp_20260712` |
| commit | `#N 正文` | `#15 优化分支命名` |
| PR/MR | 标题含议题号 | 建分支时同步建 Draft |

人不规范 → AI 从数字前缀推议题号，无则关键词反推。同议题多分支 → 全列供选。
**推测必确认。**

## 议题确认流程（写操作必经）

读操作不强制。写操作（改/新建/删）必须先确认。

1. 静默检测：分支、基线、脏区
2. 从分支名提取议题号。不规范 → 模糊映射 → 确认
3. 展示：议题 #X, 分支, 基线 → 确认

| 路径 | 行为 |
|------|------|
| 继续当前 | 不动脏区，直接开发 |
| 换议题 | 搜议题 → 确认 → 搜分支 → 处理脏区 → 切换。closed → 提示 reopen |
| 新议题 | 基线 AI 可推荐必确认 → 建分支 → 同步建 Draft PR/MR → 开发 |

脏区处理：需切换 → 脏区先 (a) 提交当前 或 (b) 暂存临时分支。未处理不切换。

## 新需求

git fetch → 确认 origin/main 最新 → 建分支（同步 Draft） → 开发 → 提交 → push。
分支/议题/Draft 一一对应。任何修改不跳流程。

## 旧议题（切换已有分支）

`git branch -a | grep "{议题号}"` + `git ls-remote --heads origin "*{议题号}*"`
临时分支优先提示。无则匹配 `{议题号}-*`。多 → 全列。无 → reopen 或当新议题。

## 提交

commit: `#N 正文`。不主动触发 CI/测试，提醒用户自查 lint/test。
cherry-pick/revert：用户给 SHA，AI 不自选。议题正文开发完一次性更新。
用户说 push/推送/推 → push（禁止直推 main/master，必须走 PR/MR）。给 PR/MR URL。合并仅用户手动（高危）。

## 禁止操作

| 操作 | 规则 |
|------|------|
| `git rebase` | 仅用户明确要求时执行。冲突解决优先 merge |
| `git commit --amend` | 问用户，获同意才执行 |
| `git reset --hard` | 禁止 |
| `git clean -fd` | 禁止 |
| `git push --force / -f` | 禁止，无绕过 |
| `git push origin main` / `master` | 禁止，必须走 PR/MR |
| 冲突 (--continue/--abort/--skip) | 暂停，交用户手动 |

## 冲突与回退

冲突时优先 `git merge`，禁止 AI 自行选择 rebase。
本地 main 被污染 → 无所谓，PR 从 feature 分支走。
本地操作失败 → 暂停，交用户决策。禁止 AI 降级兜底（如 rebase 失败 → reset --hard）。
