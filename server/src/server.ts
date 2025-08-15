#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Prompt, Tool } from "@modelcontextprotocol/sdk/types.js";
import { ListToolsRequestSchema, CallToolRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { buildAnySpecsCompressMessages } from "./prompts/anyspecsCompress.js";
import { saveAnySpecsDef, handleSaveAnySpecs } from "./tools/saveAnyspecs.js";

async function main() {
  const server = new Server(
    {
      name: "anyspecs-mcp",
      version: "0.1.0"
    },
    {
      capabilities: {
        tools: {},
        prompts: {}
      }
    }
  );

  // Define prompt
  const anyspecsPrompt: Prompt = {
    name: "anyspecs-compress",
    description: "Generate a strict JSON spec from a chat markdown using the repository's docs/codeprompt.txt rules.",
    inputSchema: {
      type: "object",
      properties: {
        chat_md: { type: "string", description: "Full chat transcript in Markdown" },
        name: { type: "string", description: "Suggested filename (without extension)" },
        env_info: { type: "object", description: "Optional environment info (language/version/framework/os)" }
      },
      required: ["chat_md"]
    }
  };

  const tools: Tool[] = [saveAnySpecsDef];
  const prompts: Prompt[] = [anyspecsPrompt];

  // tools/list
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // tools/call
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    if (name === "save_anyspecs") {
      // handle tool
      return await handleSaveAnySpecs(args as any);
    }
    throw new Error(`Unknown tool: ${name}`);
  });

  // prompts/list
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return { prompts };
  });

  // prompts/get
  server.setRequestHandler(GetPromptRequestSchema, async (req) => {
    const { name, arguments: args } = req.params as any;
    if (name === "anyspecs-compress") {
      const messages = await buildAnySpecsCompressMessages(args);
      return { messages }; // Host will send these to the model
    }
    throw new Error(`Unknown prompt: ${name}`);
  });

  // Start stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // Never write to stdout; console.error writes to stderr which is allowed.
  console.error("anyspecs-mcp fatal:", err);
  process.exit(1);
});
