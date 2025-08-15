# anyspecs-mcp

简介

- 一个最小可用的 MCP 服务器：
  - Prompt `anyspecs-compress`：基于仓库 `docs/codeprompt.txt` 的规则，将一段“聊天 Markdown”压缩为“严格 JSON”。
  - Tool `save_anyspecs`：校验并将 JSON 安全保存到项目目录下的 `.anyspecs/<name>.json`。

功能要点

- 通过 stdio 与 MCP 客户端通信（Claude Code、Cursor、VS Code Copilot Chat 等）。
- 以 npm 包形式分发，可直接通过 `npx anyspecs-mcp` 使用。

目录结构

- `docs/codeprompt.txt`：压缩规则模板（系统规则）。
- `docs/USAGE.zh-CN.md`：中文使用指南。
- `docs/claude-mcp.md`：Claude Code 连接与排错。
- `server/src/server.ts`：MCP 服务器入口（stdio）。
- `server/src/prompts/anyspecsCompress.ts`：Prompt 消息构建器。
- `server/src/tools/saveAnyspecs.ts`：保存工具实现。

安装与使用（npx）

- 本项目以 npm 包形式发布，客户端可直接通过 npx 启动，无需下载源码或指定本地路径。

各客户端配置示例

- Cursor（本地 stdio）

  - 全局配置文件：`~/.cursor/mcp.json`
  - 使用 npx：
    ```json
    {
      "mcpServers": {
        "anyspecs-mcp": {
          "command": "npx",
          "args": ["-y", "anyspecs-mcp"]
        }
      }
    }
    ```

- Claude Code（CLI）

  - npx：
    ```sh
    claude mcp add anyspecs-mcp -- npx -y anyspecs-mcp
    ```
  - 管理与排错：
    ```sh
    claude mcp list
    claude mcp get anyspecs-mcp
    claude mcp remove anyspecs-mcp
    ```

- VS Code（Copilot Chat）

  - 使用 npx（stdio）：
    ```json
    {
      "mcp": {
        "servers": {
          "anyspecs-mcp": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "anyspecs-mcp"]
          }
        }
      }
    }
    ```

- Claude Desktop（配置文件）

  - `claude_desktop_config.json`：
    ```json
    {
      "mcpServers": {
        "anyspecs-mcp": {
          "command": "npx",
          "args": ["-y", "anyspecs-mcp"]
        }
      }
    }
    ```

- Windsurf

  - `windsurf.json`（或相关设置）：
    ```json
    {
      "mcpServers": {
        "anyspecs-mcp": {
          "command": "npx",
          "args": ["-y", "anyspecs-mcp"]
        }
      }
    }
    ```

- Zed

  - `settings.json`：
    ```json
    {
      "context_servers": {
        "anyspecs-mcp": {
          "command": {
            "path": "npx",
            "args": ["-y", "anyspecs-mcp"]
          }
        }
      }
    }
    ```

Prompt 说明

- 名称：`anyspecs-compress`
- 入参：
  - `chat_md`（string，必填）：整段聊天 Markdown
  - `name`（string，可选）：建议保存的文件名（不含扩展名）
  - `env_info`（object，可选）：环境信息（语言/版本/框架/OS）
- 出参：`{ messages: PromptMessage[] }`，其中助手第一条消息为规则文本，用户消息嵌入 `chat_md` 与 `env_info`。

Tool 说明

- 名称：`save_anyspecs`
- 入参：
  ```ts
  {
    data: object | string,       // 必填，最终 JSON（对象或 JSON 字符串）
    name?: string,               // 可选，文件名（无扩展名）
    dir?: string,                // 可选，默认 ".anyspecs"
    overwrite?: boolean          // 可选，默认 false
  }
  ```
- 出参：返回保存的绝对路径（字符串）。

注意事项

- npx 首次运行会下载包，可能较慢；必要时增大超时（如 `MCP_TIMEOUT=10000`）。
- 确保 Node 在 PATH 中；Windows 某些客户端可能需要 `cmd /c` 包装。
- 服务器通过 stdio 通信，由客户端拉起并保持连接。

更多文档

- Claude Code 接入与排错：`docs/claude-mcp.md`
