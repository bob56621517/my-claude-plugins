// SessionStart hook — 已废弃，Git 工作流约束已迁移至 git-workflow skill
// 保留空壳以避免破坏现有安装。
const output = {
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: "",
  },
};

console.log(JSON.stringify(output));
