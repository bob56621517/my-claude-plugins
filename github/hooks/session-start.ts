// SessionStart hook — Git 工作流约束
// matcher: startup|clear (resume/compact 不注入)
// GitHub 平台：Issue/PR
const additionalContext = `## Git 工作流约束

本项目为议题驱动开发。遇到涉及 Git 操作的需求时，必须遵循以下流程。

### 0. 项目检测与平台识别
- 首次交互静默检测 git 状态（\`git rev-parse --show-toplevel\`），检测到 git 后执行平台识别：解析 \`git remote get-url origin\` 判断远端平台
- **平台术语映射**：GitHub → Issue/PR，Gitee → 任务/PR，GitLab → Issue/MR。全文交流使用对应平台的术语
- 平台检测失败时降级为通用术语（Issue/PR）
- 仅当未检测到 git 目录时才主动提示用户
- 用户明确放弃 → 本会话不再提工作流；用户主动提 git 操作 → 重新激活

### 0.1 工具优先级
执行 git 相关操作时，按以下优先级选择工具：
1. **git 命令**（\`git add/commit/push/branch\` 等）— 最高优先级
2. **平台 MCP 工具**（github/gitee/gitlab 插件暴露的 MCP 接口）— 次优先
3. **平台 CLI 工具**（\`gh\`/\`glab\` 等）— 最低优先级，仅 MCP 不可用时回退
- 禁止绕过 git 命令执行。创建分支/切换/提交必须是 git 命令，非 MCP/CLI

### A. 议题强制关联
- 用户提写操作（改/新建/删文件），必须先确认对应议题
- 读操作（查询、查看、走读）不强制
- 自动拉取议题列表匹配标题 → 全展示给用户确认；无匹配则询问是否新建议题，用户拒绝则允许继续（标记无议题）
- 议题已 closed → 提示用户，由用户自行决定是否 reopen

### B. 新需求
顺序：议题确认 → git pull（保持 main 最新）→ 从 main 创建分支 → 本地切换 → 开发 → 提交 → push → PR/MR
- 分支命名：\`{议题号}-{feature|bugfix}-{简短描述}\`（如 \`3-feature-unified-search\`）
- 脏工作区（有未提交改动，包括 staged/unstaged/untracked 文件）：询问用户 (a)直接提交当前分支 (b)创建 \`{议题号}_{当前分支名}_temp_{datetime}\` 临时分支
- 认证失败再提示（预期插件阶段已配好 token）
- 任何修改不跳流程
- PR/MR 在开发完成后创建

### C. 旧议题
- 分支已存在：查找分支时优先匹配 \`{议题号}_*_temp_*\`，有则提示用户先处理（切换或清理），然后根据议题编号和分支前缀去匹配，因分支命名不规范而找不到则让用户选择 → 向用户展示议题标题/摘要 → 用户确认后切换
- 分支已删或不存在（用户也找不到）：询问用户 reopen 或新建议题，按新需求流程走

### D. 执行与提交
- commit message 格式：#<议题编号> <正文>（如 #9 优化分支命名格式）
- 需求每次变更后同步更新议题正文（议题是需求的草稿本）
- 提交前 AI 不主动触发 CI/测试等外部验证流程（pre-commit hook 自动运行的不干涉），默认提醒用户检查本地 lint/test
- rebase 操作必须先询问用户，AI 不主动执行 rebase
- cherry-pick / revert 需要用户明确给出 commit SHA，AI 不自行选择

### E. Push 与 PR/MR
- 触发词精确匹配才 push：\`push\`、\`推送\`、\`项目完成\`（不语义推断）
- 每次推送都给出 PR/MR URL；首次推送时若还没有 PR/MR → 自动创建 Draft PR/MR，开发完成后通知用户转为正式
  - 给出 URL 目的：让用户去 review，不会自动 approve/merge
- force push 一律禁止执行，不设 \`!\` 前缀绕过机制
- 任何 merge/rebase 执行中发生冲突时暂停并提示用户手动处理，AI 不执行 \`--continue\`
- 合并仅用户手动（被视为高危操作）
- 合并后分支删除不管`;

const output = {
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: additionalContext,
  },
};

console.log(JSON.stringify(output));
