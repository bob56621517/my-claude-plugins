# filesystem

文件系统 MCP（项目级安装），支持限定目录内的文件读写遍历操作。

## 环境变量

```bash
# 单目录
FILESYSTEM_ALLOWED_DIR=/path/to/allowed/directory
# 多目录（用 : 或 ; 分隔）
FILESYSTEM_ALLOWED_DIR=/path/a:/path/b:/path/c
```

## 配置

```json
{
  "env": {
    "FILESYSTEM_ALLOWED_DIR": "/path/to/project:/other/path"
  }
}
```
