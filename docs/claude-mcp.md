Claude Code 连接 anyspecs-mcp（MCP 指南）
=========================================

本文说明如何在 Claude Code/Claude Desktop 中，通过 MCP（Model Context Protocol）连接本仓库的 anyspecs-mcp 服务器，并在对话中使用其 Prompt 与 Tool。

前提准备
- 构建本地服务器：
  - `cd server && npm install && npm run build`
  - 产物：`server/dist/server.js`

方式一：本地 stdio（推荐）
- 本地 stdio 是最简单、最稳定的接入方式；Claude 以本地子进程方式运行 MCP 服务器，通过标准输入输出通信，无需占用端口。

添加服务器
- 本地范围（默认，仅自己在当前项目可用）：
  - `claude mcp add anyspecs-mcp -- node /ABSOLUTE/PATH/TO/anyspecs-mcp/server/dist/server.js`
- 项目范围（写入项目根的 `.mcp.json`，团队共享）：
  - `claude mcp add anyspecs-mcp --scope project -- node /ABSOLUTE/PATH/TO/anyspecs-mcp/server/dist/server.js`
- 用户范围（在本机所有项目可用）：
  - `claude mcp add anyspecs-mcp --scope user -- node /ABSOLUTE/PATH/TO/anyspecs-mcp/server/dist/server.js`
- Windows（需要 cmd /c 包装）：
  - `claude mcp add anyspecs-mcp -- cmd /c node C:\\absolute\\path\\to\\anyspecs-mcp\\server\\dist\\server.js`
- 通过 JSON 添加：
  - `claude mcp add-json anyspecs-mcp '{"type":"stdio","command":"node","args":["/ABSOLUTE/PATH/TO/anyspecs-mcp/server/dist/server.js"],"env":{}}'`

验证与管理
- 列表与详情：`claude mcp list`、`claude mcp get anyspecs-mcp`
- 在 Claude Code 中输入 `/mcp` 查看状态与调试
- 删除：`claude mcp remove anyspecs-mcp`

使用（在 Claude 中）
- Prompt（斜杠命令）：`/mcp__anyspecs-mcp__anyspecs-compress`
  - 参数：
    - `chat_md`（必填）：整段聊天记录 Markdown
    - `name`（可选）：建议保存的文件名（无扩展名）
    - `env_info`（可选）：环境信息对象（语言/版本/框架/OS）
  - 作用：生成“仅一份合法 JSON（无代码围栏）”的压缩结果（规则来自仓库 `docs/codeprompt.txt`）
- 工具：`save_anyspecs`
  - 参数：
    - `data`（必填）：上一步生成的 JSON（对象或字符串）
    - `name`（可选）：文件名（无扩展名，默认 `anyspecs-<UTC时间戳>`）
    - `dir`（可选）：保存目录，默认 `.anyspecs`
    - `overwrite`（可选）：是否覆盖同名文件，默认 `false`
  - 结果：在仓库 `.anyspecs/` 目录下写入 `<name>.json`，并返回保存路径

范围（Scope）说明
- local（默认）：仅当前项目对你可见；适合个人试用与私有配置
- project：写入项目 `.mcp.json`，团队共享；适合协作
- user：你的用户在本机所有项目可用；适合常用个人工具
- 同名冲突时优先级：local > project > user

常见问题与排查
- 路径错误：确保传入的是 `server/dist/server.js` 的绝对路径，且 Node 可执行（`node -v`）
- 未构建：若 dist 目录不存在，请在 `server` 下执行 `npm install && npm run build`
- 启动超时：可设置 `MCP_TIMEOUT=10000`（单位 ms），例如 `MCP_TIMEOUT=10000 claude mcp add ...`
- 日志：本服务器为 stdio 形态时不要向 stdout 打日志（JSON-RPC 会被污染）。错误日志使用 stderr（已在代码中使用 `console.error`）。

HTTP/SSE（可选扩展）
- 目前仓库默认提供 stdio 传输（开箱即用）。如需面向远程/容器环境的 HTTP `/mcp` 或 SSE `/sse` 接入，可按需扩展入口（`--transport <stdio|http|sse> --port <number>`）。如你需要，我可以在 `server/src` 中增加对应的 HTTP/SSE Transport 与 CLI 开关。

更多参考
- 中文使用说明：`docs/USAGE.zh-CN.md`
- 规则模板：`docs/codeprompt.txt`

