import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { safeJoinCwd, sanitizeFileName, writeFileSafe, pathExists, timestampName } from "../utils/fs.js";

type SaveArgs = {
  data: unknown | string;
  name?: string;
  dir?: string;
  overwrite?: boolean;
};

export const saveAnySpecsDef: Tool = {
  name: "save_anyspecs",
  description: "Validate and save the generated JSON into the .anyspecs directory.",
  inputSchema: {
    type: "object",
    properties: {
      data: { description: "JSON object or stringified JSON", anyOf: [{ type: "object" }, { type: "string" }] },
      name: { type: "string", description: "Base filename without extension" },
      dir: { type: "string", description: "Target directory (default .anyspecs)" },
      overwrite: { type: "boolean", description: "Overwrite if exists (default false)" }
    },
    required: ["data"]
  }
};

export const handleSaveAnySpecs = async (args: SaveArgs) => {
  const dir = sanitizeDir(args.dir ?? ".anyspecs");
  let filename = sanitizeFileName(args.name ?? timestampName());
  const overwrite = Boolean(args.overwrite ?? false);

  let obj: unknown;
  if (typeof args.data === "string") {
    try {
      obj = JSON.parse(args.data);
    } catch (e) {
      throw new Error("data is string but not valid JSON");
    }
  } else {
    obj = args.data;
  }

  // Basic shape validation (optional minimal check)
  if (!obj || typeof obj !== "object") {
    throw new Error("data must be a JSON object or a valid JSON string");
  }

  const targetPathBase = safeJoinCwd(`${dir}/${filename}.json`);
  let targetPath = targetPathBase;

  // Handle conflicts
  if (!overwrite) {
    let i = 1;
    while (await pathExists(targetPath)) {
      targetPath = safeJoinCwd(`${dir}/${filename}-${i}.json`);
      i += 1;
    }
  }

  await writeFileSafe(targetPath, JSON.stringify(obj, null, 2));

  return {
    content: [
      {
        type: "text",
        text: `Saved to ${targetPath}`
      }
    ]
  };
};

function sanitizeDir(d: string): string {
  // prevent leaving cwd; actual enforcement in safeJoinCwd
  return d.replace(/\\/g, "/").replace(/\./g, ".").replace(/[^a-zA-Z0-9._/\-]/g, "-");
}
