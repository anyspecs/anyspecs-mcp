anyspecs-mcp
=================

Minimal MCP server that exposes:
- Prompt `anyspecs-compress`: returns messages (system+user) to compress a chat transcript into a strict JSON spec using `docs/codeprompt.txt` rules.
- Tool `save_anyspecs`: validates and saves the produced JSON into `.anyspecs/<name>.json`.

Project structure
- `docs/codeprompt.txt`: The system rules used by the prompt.
- `server/src/server.ts`: MCP server entry.
- `server/src/prompts/anyspecsCompress.ts`: Prompt message builder.
- `server/src/tools/saveAnyspecs.ts`: Save tool implementation.

Usage
1) Install dependencies (requires network):
   - `cd server && npm install`
   - `npm run build`
2) Configure your MCP host (e.g., Claude Desktop) to launch the server via stdio:
   Example `claude_desktop_config.json` snippet:
   {
     "mcpServers": {
       "anyspecs-mcp": {
         "command": "node",
         "args": ["/ABSOLUTE/PATH/TO/anyspecs-mcp/server/dist/server.js"],
         "env": { }
       }
     }
   }

Prompt contract
- name: `anyspecs-compress`
- input:
  - `chat_md` (string, required): Chat transcript in Markdown
  - `name` (string, optional): Suggested filename base (no extension)
  - `env_info` (object, optional): Environment info to include
- output: `{ messages: PromptMessage[] }` where the system message is `docs/codeprompt.txt` and the user message embeds `chat_md` and optional `env_info`.

Tool contract
- name: `save_anyspecs`
- input: {
    data: object|string (required),
    name?: string,
    dir?: string (default ".anyspecs"),
    overwrite?: boolean (default false)
  }
- output: text content with the saved path.

Notes
- Never write logs to stdout in stdio mode; use stderr (e.g., console.error).
- The tool enforces writing within the repository working directory.

