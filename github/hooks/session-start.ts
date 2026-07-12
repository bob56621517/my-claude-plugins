// SessionStart hook — Git 工作流约束
// matcher: startup|clear (resume/compact 不注入)
// GitHub 平台：Issue/PR
//
// ⚠️ 此文件与 gitee/hooks/session-start.ts、gitlab/hooks/session-start.ts 内容同步
// 三份文件除本行外完全一致。修改时务必三方同步更新。
const additionalContext = `## Git 工作流约束

### 平台检测
首交互静默 \`git rev-parse --show-toplevel\`。有 git → 解析 \`git remote get-url origin\` 判平台。
术语: GitHub→Issue/PR, Gitee→任务/PR, GitLab→Issue/MR。失败→降级通用(Issue/PR)。
无 git 目录→提示。用户放弃→本会话不提。用户提 git→重激活。

### 具体流程(仅涉 Git 操作时激活)
议题驱动。涉 git 操作(提交/push/分支/PR/MR等)激活。

#### 工具优先级
git能做必用 > 平台MCP(补不足) > gh/glab

#### 命名

| 对象 | 格式 | 示例 |
|------|------|------|
| 常规分支 | \`{议题号}-{类型}-{描述}\` | \`3-feature-unified-search\` |
| 临时分支 | \`{当前分支}_temp_{date}\` | \`3-feature-unified-search_temp_20260710\` |
| commit | \`#<议题号> <正文>\` | \`#9 优化分支命名\` |
| PR/MR | 标题含议题号 | 建分支时同步建 Draft |

人不规范→AI从数字前缀推议题号,无则关键词反推。同议题多分支→全列供选。
**推测必确认。**

#### 议题确认(写操作必经)
读操作不强制。写操作(改/新建/删)必须先确认。
1. 静默检测: 分支、基线、脏区
2. 从分支名提取议题号。不规范→模糊映射→确认
3. 展示: 议题 #X, 分支, 基线 → 确认

| 路径 | 行为 |
|------|------|
| 继续当前 | 不动脏区,直接开发 |
| 换议题 | 搜议题→确认→搜分支→处理脏区→切换。closed→提示 reopen |
| 新议题 | 基线AI可推荐必确认→建分支→同步建 Draft PR/MR→开发 |

脏区处理: 需切换→脏区先(a)提交当前 或(b)暂存临时分支。未处理不切换。

#### 新需求
建分支(同步 Draft)→开发→提交→push。分支/议题/Draft 一一对应。任何修改不跳流程。

#### 旧议题(切换已有分支)
\`git branch -a | grep "{议题号}"\` + \`git ls-remote --heads origin "*{议题号}*"\`
临时分支优先提示。无则匹配 \`{议题号}-*\`。多→全列。无→reopen 或当新议题。

#### 提交
commit: \`#N 正文\`。不主动触发 CI/测试,提醒用户自查 lint/test。
cherry-pick/revert: 用户给 SHA,AI 不自选。议题正文开发完一次性更新。
用户说 push/推送/推 → push。给 PR/MR URL。合并仅用户手动(高危)。

| 操作 | 规则 |
|------|------|
| \`git rebase\` | 问用户,获同意才执行 |
| \`git commit --amend\` | 问用户,获同意才执行 |
| \`git reset --hard\` | 禁止 |
| \`git clean -fd\` | 禁止 |
| \`git push --force / -f\` | 禁止,无绕过 |
| 冲突(--continue/--abort/--skip) | 暂停,交用户手动 |`;

const output = {
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: additionalContext,
  },
};

console.log(JSON.stringify(output));
