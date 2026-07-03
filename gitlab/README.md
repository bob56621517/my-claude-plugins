# gitlab

GitLab MCP，支持仓库/Issue/MR/分支/CI Pipeline 管理，支持自托管实例。

## 环境变量

```bash
GITLAB_PERSONAL_ACCESS_TOKEN=<你的 GitLab Token>
GITLAB_API_URL=https://your-gitlab-instance.com/api/v4
```

## 配置

```json
{
  "env": {
    "GITLAB_PERSONAL_ACCESS_TOKEN": "glpat-xxx",
    "GITLAB_API_URL": "https://gitlab.example.com/api/v4"
  }
}
```
