# Tool Preferences

当用户未明确指定工具时，按以下生态默认使用对应工具：

| 生态 | 默认工具 | 说明 |
|------|---------|------|
| Python | `uvx` | 包管理器、运行工具、脚本执行均优先使用 uvx |
| Node.js / JS / TS | `bun` | 包管理器（替代 npm/yarn/pnpm）、运行时（替代 node）均使用 bun |
| Java | `mvn` | 包管理、构建工具默认使用 Maven |
| Github | `gh` | GitHub 相关操作首选 gh CLI |
| Gitlab | `glab` | GitLab 相关操作首选 glab CLI |

用户显式指定工具时，以用户指定为准。
