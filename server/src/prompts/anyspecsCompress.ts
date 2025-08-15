import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import type { PromptMessage } from "@modelcontextprotocol/sdk/types.js";
import { pathExists } from "../utils/fs.js";

export type AnySpecsCompressArgs = {
  chat_md: string;
  name?: string;
  env_info?: Record<string, unknown>;
};

export async function buildAnySpecsCompressMessages(args: AnySpecsCompressArgs): Promise<PromptMessage[]> {
  const { chat_md, env_info } = args;
  // Resolve codeprompt rules from packaged assets first, then fall back to repo docs.
  const here = dirname(fileURLToPath(import.meta.url));
  const packaged = resolve(here, "../../assets/codeprompt.txt"); // server/dist/prompts -> server/assets
  const repoDocs = resolve(here, "../../../docs/codeprompt.txt"); // repo fallback for dev
  const codePromptPath = (await pathExists(packaged)) ? packaged : repoDocs;
  const systemText = await readFile(codePromptPath, "utf8");

  const userBlocks: string[] = [];
  userBlocks.push("以下为对话原文（Markdown）。请严格按系统规则仅输出一份合法 JSON，无代码围栏：\n\n");
  userBlocks.push(chat_md);
  if (env_info && Object.keys(env_info).length > 0) {
    userBlocks.push("\n\n[env_info]\n" + JSON.stringify(env_info, null, 2));
  }

  return [
    {
      role: "assistant",
      content: { type: "text", text: systemText }
    },
    {
      role: "user",
      content: { type: "text", text: userBlocks.join("") }
    }
  ];
}
