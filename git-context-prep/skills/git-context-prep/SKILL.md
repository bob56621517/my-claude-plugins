---
name: git-context-prep
description: >-
  当用户明确用"开始"或"继续"后接"任务"/"议题"/"issue"/"#N"/"task"时触发。例如：开始任务、继续 #15、start task、continue issue。单独出现"开始"或"任务"不触发。
---

# git-context-prep: 议题/任务上下文准备

git-context-prep skill 只在"开始或切换议题/任务"时触发。纯 git 操作（commit/push/merge/rebase/pull）不依赖本 skill。

## 两个入口

```
入口 A: "开始任务 X"     → 搜索议题
                           ├── 搜索到 → 确认 → 走入口 B
                           └── 没搜到 → 创建新议题 → 完整新建流程
入口 B: "继续 #N"        → 基于已有议题跳转
```

---

## Step 1：远端操作（仅 MCP / 平台 API）

远端平台操作，语义目标描述，AI 自行选择平台 MCP 或 CLI 实现。不执行任何 git CLI 命令。

### 入口 A：开始任务

#### A1. 搜索议题

AI 从用户描述提取关键词，搜索开放议题。

```
├── 搜索到 → 列出 top 3-5 个（标题 + 编号 + 标签），用户选择确认
│            → 走入口 B 流程（基于已有议题继续）
│
└── 没搜到 → AI 生成标题+描述+推断标签，展示确认 → 创建新议题
             → 继续 A2
```

创建议题字段：标题、描述、标签（AI 推断）

#### A2. 分支类型确认

AI 从 feature/fix/docs/refactor/test/chore 推断，用户确认。

#### A3. 选择分支基线

平台 API 列出远端分支：默认分支 + 最近活跃的 10-20 条分支（排除临时分支），用户选择从哪条基线分出。

#### A4. 基于基线创建远端分支

平台 API 基于所选基线在远端创建分支：`{议题号}-{类型}-{描述}`

#### A5. 创建 Draft PR（远端）

按平台分叉：

- **GitHub**: `draft: true`，描述含 `Closes #N`，设置 `delete_branch_on_merge`
- **GitLab**: 标题前缀 `Draft:`，描述含 `Closes #N`，检查项目级删分支配置，未开启则提示
- **Gitee**: 不支持 Draft → 创建普通 PR 并提示，描述含 `Closes #N`，删分支不支持则告知

#### A6. 记录信息

记录传给 Step 2：议题号（纯数字）、远端分支名、基线分支、Draft PR URL

### 入口 B：继续 #N

#### B1. 检查议题状态

已关闭则提示是否 reopen。

#### B2. 搜索远端分支

平台 API 搜索匹配议题号的远端分支。搜不到 → 回退：搜索标签、关键词，或允许用户手动输入分支名。

#### B3. 搜索 PR

平台 API 检查关联开放 PR/MR。

#### B4. 路由判断

```
├── 分支有 + PR 有
│   展示基线（PR 的 base branch）→ 确认 → 传给 Step 2
│
├── 分支有 + PR 无
│   选择基线（同A3）→ 确认 → 创建 Draft PR（同A5）→ 传给 Step 2
│
└── 分支无
    选择基线（同A3）→ 远端创建分支（同A4）→ 创建 Draft PR（同A5）→ 传给 Step 2
```

---

## Step 2：本地同步（纯 git CLI）

无 MCP 介入。Step 1 完成后，把远端分支同步到本地。

### 流程

```
Step 1 完成
    │
    ▼ git fetch origin

    ┌── 当前分支就是目标分支？
    │   → 跳过脏区处理，直接拉取
    │   git pull origin {分支}
    │       ├── 无冲突 → 上下文准备完成
    │       └── 冲突 → AI 展示 diff 和合并建议，用户手动解决
    │
    └── 当前分支不是目标分支
        │
        ┌── 有 dirty state？
        │   遵循脏区处理约定 → 处理完才继续
        │
        ▼ 检查本地分支是否存在
        │
        ├── 本地不存在
        │   git switch --create {分支} origin/{分支}
        │   上下文准备完成
        │
        └── 本地已存在
            git switch {分支}
            git pull origin {分支}
                ├── 无冲突 → 上下文准备完成
                └── 冲突 → AI 展示 diff 和合并建议，用户手动解决
```

### 脏区处理（四方案，用户选择）

| 方案 | 命令 | 适用场景 |
|------|------|----------|
| a. 提交当前 | `git add` + `git commit` | 工作已完成，可独立提交 |
| b. 暂存临时分支 | `git switch -c {分支}_temp_{YYMMDD}_{序号}` 后 commit | 内容多/重要，持久保存 |
| c. 本地 stash | `git stash push -m "{标记}"` | 工作未完成，临时切走，回来 pop |
| d. 跳过（不推荐） | 不执行任何操作 | 用户明确要求直接切换，AI 警告后执行 |

未处理脏区前禁止切换分支（选择 d 时除外）。

### 冲突处理

`git pull` 产生冲突后，AI 主动辅助用户解决：

1. 展示冲突文件列表和冲突 diff
2. 分析冲突内容，提供合并建议（保留哪方、如何合并）
3. 用户参考建议手动编辑解决
4. 用户报告已解决后 → `git status` 验证冲突标记已清除 → 提醒用户完成 `git add` + `git commit` 完成 merge

AI 不做 --continue / --abort / --skip，由用户决策后手动执行。

---

## 命名约定

| 对象 | 格式 | 示例 |
|------|------|------|
| 常规分支 | `{议题号（纯数字）}-{类型}-{描述}` | `15-feature-git-workflow-fix` |
| 临时分支 | `{当前分支}_temp_{YYYYMMDD}_{序号}` | `15-feature-git-workflow-fix_temp_20260712_1` |
| commit | `#N 正文` | `#15 优化分支命名` |
| Draft PR 标题 | `WIP: #N {类型}: {简短描述}` | `WIP: #15 feature: git workflow fix` |

推测议题号时，必须向用户确认。

## 禁止操作

- `git rebase` / `git commit --amend` — 先问用户
- `git reset --hard` / `git clean -fd` — 禁止
- `git push --force / -f` — 禁止
- 冲突 — AI 展示 diff 并提出合并建议，用户手动解决后通知 AI 验证

---

## 附录：后续操作提示

### 提交

commit 格式：`#N 提交文本`（如 `#15 优化分支命名`）

### 推送后

push 完成后，向用户展示 Draft PR URL，提示用户前往审核。
