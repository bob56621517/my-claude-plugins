---
name: git-context-prep
description: >-
  开始或继续一个议题/任务时使用: "开始任务"、"继续 #N"、"处理议题"、"开始工作"、"开工"、"start issue/task"、含有 #N 号。
---

# git-context-prep: 议题/任务上下文准备

本 skill 只在"开始或切换议题/任务"时触发。
纯 git 操作（commit/push/merge/rebase）不依赖本 skill。

## 1. 平台检测

1a. `git fetch origin`
1b. `git status -sb`
1c. `git branch -vv`
1d. `git remote get-url origin` → 判断平台类型（GitHub / GitLab / Gitee / 其他）

## 2. git CLI 命令直接写，平台 API 写语义目标

- git CLI 命令（`git fetch` / `git switch` / `git stash` 等）直接写在操作步骤中
- 平台 API 操作以语义目标描述（例如："创建 Draft PR"，不写 `gh pr create` 或任何 MCP 工具名）
- AI 根据当前可用 MCP 工具和 CLI 自行选择实现方式
- 工具优先级：git CLI > 平台 MCP > gh/glab

## 3. 当前状态静默检测

3a. 当前分支名 → 提取议题号（如有）
3b. 基础分支（通常是 main/master）
3c. 工作区是否有未提交变更（dirty state）

## 4. 议题确认流程

**所有写操作（切换分支/创建分支/新建议题）必须先向用户确认。**

4a. 从分支名提取议题号。不规范命名（如 `fix-login` 无 #N）→ 模糊匹配议题 → 向用户确认
4b. 展示确认信息：议题 #N（标题）、当前分支、基础分支
4c. 等待用户确认后再执行

## 5. 操作路径

### 5a. 继续当前分支
- 如有 dirty state：提示用户选择 commit 或 stash
- 直接开始开发

### 5b. 切换到已有分支（同一议题的其他分支或不同议题）
- `git fetch origin`（确保远程分支最新）
- `git branch -a | grep "{议题号}"`
- `git ls-remote --heads origin "*{议题号}*"`
- 临时分支（后缀 `_temp_`）优先提示
- 多个匹配 → 列出所有供选择
- 无匹配 → 提示是否当新议题处理
- 脏区处理：dirty state 必须先 stash 再切换。`git stash push -m "{标记}"`。切换后提示用户。
- `git pull origin {目标分支}`

### 5c. 新建议题/任务
- `git fetch origin`
- 确认基础分支（origin/main 或 origin/master）已是最新
- `git switch -c {议题号}-{类型}-{描述}`
- 创建 Draft PR（语义目标：为该分支创建一个 Draft Pull Request/Merge Request，标题包含议题号）

## 6. 脏区处理规则

- 不切换分支时：保持 dirty state，直接开始开发
- 需要切换分支时：必须先处理 dirty state。方案：
  a. 用户选择暂存到临时分支（推荐）
  b. 用户选择提交当前工作
- 未处理 dirty state 前禁止切换分支
- 不自动选择方案，交用户决策

## 7. 分支命名参考

| 场景 | 格式 | 示例 |
|------|------|------|
| 常规分支 | `{议题号}-{类型}-{描述}` | `15-feature-git-workflow-fix` |
| 临时分支 | `{当前分支}_temp_{YYYYMMDD}` | `15-feature-git-workflow-fix_temp_20260712` |

推测议题号时，必须向用户确认，不能直接使用。

## 8. 新建分支后的操作

`git fetch origin` → 确认基础分支最新 → 建分支（含议题号）→ 创建 Draft PR/MR（语义目标）→ 开始开发

## 附录：后续操作参考

上下文准备完成后，进行后续 git 操作时参考以下约定：

### 提交
commit 格式：`#N 正文`（如 `#15 优化分支命名`）

### 禁止操作
- `git rebase` / `git commit --amend` — 先问用户
- `git reset --hard` / `git clean -fd` — 禁止
- `git push --force / -f` — 禁止
- 冲突（--continue/--abort/--skip）— 交用户手动
