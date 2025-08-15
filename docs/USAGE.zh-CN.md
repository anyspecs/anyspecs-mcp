anyspecs-mcp 使用说明（中文）
=============================

概述

- 这个 MCP 服务器提供：
  - Prompt `anyspecs-compress`：基于 `docs/codeprompt.txt` 的规则，将整段聊天记录（Markdown）压缩成一份严格且合法的 JSON。
  - Tool `save_anyspecs`：校验并将该 JSON 保存到仓库根目录的 `.anyspecs/` 下。

前置条件

- Node.js 18+（建议 LTS）。
- 在项目根目录存在 `docs/codeprompt.txt`（已提供）。

安装与构建

1. 打开终端进入 `server` 目录：
   - `cd server`
2. 安装依赖并构建：
   - `npm install`
   - `npm run build`

在 MCP 客户端中配置（以 Claude Desktop 为例）

1. 打开配置文件：
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. 在 `mcpServers` 中增加：

```
{
  "mcpServers": {
    "anyspecs-mcp": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/anyspecs-mcp/server/dist/server.js"
      ]
    }
  }
}
```

3. 将路径替换为你本机该项目的绝对路径，保存并重启 Claude Desktop。

如何使用（交互流程）

1) 选择提示（Prompt）

- 在支持 MCP 的客户端中，找到并选择 Prompt `anyspecs-compress`。
- 填写参数：
  - `chat_md`（必填）：整段聊天记录（Markdown 文本）。
  - `name`（可选）：建议保存的文件名（不含扩展名）。
  - `env_info`（可选）：环境信息对象（如语言/版本/框架/OS）。
- 该 Prompt 会返回两条消息（system + user）。客户端会将这些消息直接喂给模型，让模型“仅输出一份合法 JSON（无代码围栏）”。

2) 保存 JSON（Tool）

- 当模型输出了合法 JSON 后，调用工具 `save_anyspecs`：
  - `data`：模型输出的 JSON（对象或字符串）。
  - `name`（可选）：文件名（不含扩展名）。未提供则使用 `anyspecs-<UTC时间戳>`。
  - `dir`（可选）：保存目录，默认 `.anyspecs`。
  - `overwrite`（可选）：是否覆盖同名文件（默认 false）。
- 工具会在 `.anyspecs/` 下写入 `<name>.json` 并返回保存路径。

文件保存位置与命名

- 目录：`.anyspecs/`
- 默认文件名：`anyspecs-YYYYMMDD-HHMMSSZ.json`
- 若指定 `name`，将使用清洗后的文件名：`<name>.json`。若重名且 `overwrite=false`，将自动添加 `-1`、`-2` 后缀。

示例（典型工作流）

1. 你在会话窗口中粘贴整段聊天记录（Markdown）并选择 Prompt `anyspecs-compress`，仅填写 `chat_md`。
2. 模型按 `docs/codeprompt.txt` 的规则输出严格的 JSON（只有一份、无代码围栏）。
3. 模型或你手动调用 `save_anyspecs`：
   - `data`：粘贴刚生成的 JSON；
   - `name`：可选，比如 `refactor-auth-flow`；
   - 工具返回：`Saved to <项目路径>/.anyspecs/refactor-auth-flow.json`。

常见问题（FAQ）

- 模型输出不是合法 JSON：
  - 请让模型按照系统规则修正后再次调用 `save_anyspecs`。
- 文件名冲突：
  - 设置 `overwrite=true` 覆盖，或更换 `name`，或使用默认时间戳命名。
- 路径安全：
  - 工具限制只能在项目工作目录内写入，避免路径逃逸。
- 日志输出：
  - 以 stdio 方式运行时，避免向 stdout 打印日志；错误与调试输出应写到 stderr。

自定义

- 更改 JSON 规则：修改 `docs/codeprompt.txt` 内容（system 提示）。
- 更改默认目录/文件名：在调用 `save_anyspecs` 时传 `dir`、`name` 参数即可。

项目结构（相关部分）

- `docs/codeprompt.txt`：系统规则（Prompt 的 system 段）。
- `server/src/server.ts`：MCP 服务器入口（stdio）。
- `server/src/prompts/anyspecsCompress.ts`：构造 system+user 消息。
- `server/src/tools/saveAnyspecs.ts`：保存工具实现。
- `.anyspecs/`：输出 JSON 存放目录（运行时生成）。
