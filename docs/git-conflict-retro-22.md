# Git 冲突复盘：#22

## 场景

更新本地 main 分支时 `git pull` 自动合并失败。远程删除了文件，本地有修改。

## 教训

### 1. `git log main ^origin/main` ≠ "领先"

```
git log --oneline main ^origin/main
```

这个命令只列出"在 main 但不在 origin/main 的提交"，不代表本地领先。分叉（diverged）和领先（ahead）是两码事。

**修正**: 加上日期判断：

```bash
git log --oneline --date=short --format="%h %ai %s" main | head -5
git log --oneline --date=short --format="%h %ai %s" origin/main | head -5
```

日期新的那一方才是更新的一方。

### 2. `git status` 的 `have diverged` 不是谎言

```
Your branch and 'origin/main' have diverged
```

明确告诉你"分叉"，但容易惯性忽略。看到这个提示就应该去比日期。

### 3. 冲突时先比日期，再决定方向

不拿 commit 数量当领先判断依据。先看哪边更新。

## 正确流程

```bash
git merge --abort                    # 放弃冲突合并
git reset --hard origin/main         # 在确认远程更新后，直接对齐远程
```
