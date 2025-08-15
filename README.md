anyspecs-mcp
=================

简介
- 一个最小可用的 MCP 服务器：
  - Prompt `anyspecs-compress`：基于仓库 `docs/codeprompt.txt` 的规则，将一段“聊天 Markdown”压缩为“严格 JSON”。
  - Tool `save_anyspecs`：校验并将 JSON 安全保存到项目目录下的 `.anyspecs/<name>.json`。

功能要点
- 支持通过 stdio 与 MCP 客户端通信（Claude Code、Cursor、VS Code Copilot Chat 等）。
- 规则文件路径在打包后可用（优先读取 `server/assets/codeprompt.txt`，开发时回退到 `docs/codeprompt.txt`）。

目录结构
- `docs/codeprompt.txt`：压缩规则模板（系统规则）。
- `docs/USAGE.zh-CN.md`：中文使用指南。
- `docs/claude-mcp.md`：Claude Code 连接与排错。
- `server/src/server.ts`：MCP 服务器入口（stdio）。
- `server/src/prompts/anyspecsCompress.ts`：Prompt 消息构建器。
- `server/src/tools/saveAnyspecs.ts`：保存工具实现。

快速开始（本地构建）
1) 安装依赖并编译（需要网络）：
   - `cd server && npm install`
   - `npm run build`
2) 用本地绝对路径接入（以 Claude Desktop 为例）：
   在 `claude_desktop_config.json` 中添加：
   ```json
   {
     "mcpServers": {
       "anyspecs-mcp": {
         "command": "node",
         "args": ["/绝对路径/anyspecs-mcp/server/dist/server.js"],
         "env": {}
       }
     }
   }
 ```

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
  - 使用本地绝对路径：
    ```json
    {
      "mcpServers": {
        "anyspecs-mcp": {
          "command": "node",
          "args": ["/绝对路径/anyspecs-mcp/server/dist/server.js"]
        }
      }
    }
    ```

- Claude Code（CLI）
  - 本地绝对路径：
    ```sh
    claude mcp add anyspecs-mcp -- node /绝对路径/anyspecs-mcp/server/dist/server.js
    ```
  - npx（发布到 npm 后，或用本地包目录 `-p file:`）：
    ```sh
    claude mcp add anyspecs-mcp --timeout 30000 -- npx -y anyspecs-mcp
    # 或（未发布）
    claude mcp add anyspecs-mcp -- npx -y -p file:/绝对路径/server anyspecs-mcp
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
  - 使用本地绝对路径：
    ```json
    {
      "mcp": {
        "servers": {
          "anyspecs-mcp": {
            "type": "stdio",
            "command": "node",
            "args": ["/绝对路径/anyspecs-mcp/server/dist/server.js"]
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

通过 npx 添加（发布到 npm 后）
- 本项目已支持将服务器打包为 npm 包并以 bin 形式启动。一旦发布到 npm（或你在本地用 `npm link`），即可像下方示例那样配置，仅用包名运行：

- Cursor（.cursor/mcp.json）：
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

- Claude Code（本地 stdio）：
  ```sh
  claude mcp add anyspecs-mcp -- npx -y anyspecs-mcp
  ```

- VS Code（Copilot Chat）：
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

本地开发（未发布时）
- 直接使用 dist 绝对路径：
  ```sh
  claude mcp add anyspecs-mcp -- node /绝对路径/anyspecs-mcp/server/dist/server.js
  ```
- 使用 npm link（生成全局命令）：
  ```sh
  cd server && npm link
  ```
  客户端里把 command 设为 `anyspecs-mcp` 即可。
- 使用 npx 指向本地包目录：
  ```sh
  claude mcp add anyspecs-mcp -- npx -y -p file:/绝对路径/server anyspecs-mcp
  ```

注意事项
- npx 首次运行会下载包，可能较慢；必要时增大超时（如 `MCP_TIMEOUT=10000`）。
- 确保 Node 在 PATH 中；Windows 某些客户端可能需要 `cmd /c` 包装。
- 服务器通过 stdio 通信，不要向 stdout 打印普通日志；错误使用 stderr（`console.error`）。

更多文档
- Claude Code 接入与排错：`docs/claude-mcp.md`
- 中文使用说明：`docs/USAGE.zh-CN.md`
