#!/usr/bin/env node
import * as p from "@clack/prompts";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { dashCase, scaffoldProject } from "./scaffold.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

async function main(): Promise<void> {
  p.intro("Create a new NRG project");

  const args = process.argv.slice(2);
  const positionalName = args.find((a) => !a.startsWith("-"));

  const project = await p.group(
    {
      projectName: () =>
        p.text({
          message: "What would you like to name your project?",
          placeholder: "nrg-project",
          defaultValue: positionalName || "nrg-project",
          initialValue: positionalName,
          validate: (value) => {
            if (!value?.trim()) return "Project name is required.";
          },
        }),
      nodeName: () =>
        p.text({
          message: "What would you like to name your first node?",
          placeholder: "node-1",
          defaultValue: "node-1",
          validate: (value) => {
            if (!value?.trim()) return "Node name is required.";
          },
        }),
      nodeCategory: () =>
        p.text({
          message: "Which category should your node belong to?",
          placeholder: "new category",
          defaultValue: "new category",
        }),
      nodeColor: () =>
        p.text({
          message: "What color should represent your node? (hex)",
          placeholder: "#1A1A1A",
          defaultValue: "#1A1A1A",
          validate: (value) => {
            if (!value || !/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value)) {
              return "Please enter a valid hex color code (e.g., #1A1A1A or #000)";
            }
          },
        }),
      nodeInputs: () =>
        p.text({
          message: "How many inputs should your node have? (0 or 1)",
          placeholder: "1",
          defaultValue: "1",
          validate: (value) => {
            const n = parseInt(value || "", 10);
            if (n !== 0 && n !== 1) return "Inputs must be either 0 or 1.";
          },
        }),
      nodeOutputs: () =>
        p.text({
          message: "How many outputs should your node have?",
          placeholder: "1",
          defaultValue: "1",
          validate: (value) => {
            const n = parseInt(value || "", 10);
            if (isNaN(n) || n < 0) return "Outputs must be 0 or more.";
          },
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    },
  );

  const projectName = project.projectName as string;
  const nodeName = project.nodeName as string;
  const nodeCategory = project.nodeCategory as string;
  const nodeColor = project.nodeColor as string;
  const nodeInputs = project.nodeInputs as string;
  const nodeOutputs = project.nodeOutputs as string;

  const projectDir = path.resolve(process.cwd(), dashCase(projectName));

  if (fs.existsSync(projectDir)) {
    p.cancel(`Directory "${dashCase(projectName)}" already exists.`);
    process.exit(1);
  }

  const s = p.spinner();
  s.start("Scaffolding project...");

  scaffoldProject(projectDir, TEMPLATES_DIR, {
    projectName,
    nodeName,
    nodeCategory,
    nodeColor,
    nodeInputs,
    nodeOutputs,
  });

  s.stop("Project scaffolded.");

  p.note(
    [`cd ${dashCase(projectName)}`, `pnpm install`, `pnpm run dev`].join("\n"),
    "Next steps",
  );

  p.outro("Happy coding!");
}

main().catch((err) => {
  p.cancel("Something went wrong.");
  console.error(err);
  process.exit(1);
});
