import * as fs from "node:fs";
import * as path from "node:path";

export function dashCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function pascalCase(str: string): string {
  return dashCase(str)
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export function renderTemplate(
  content: string,
  vars: Record<string, string>,
): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? _);
}

export function copyTemplateDir(
  srcDir: string,
  destDir: string,
  vars: Record<string, string>,
): void {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const renderedName = renderTemplate(entry.name, vars);
    const destPath = path.join(destDir, renderedName);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplateDir(srcPath, destPath, vars);
    } else if (entry.name.endsWith(".hbs")) {
      const outPath = destPath.replace(/\.hbs$/, "");
      const content = fs.readFileSync(srcPath, "utf-8");
      fs.writeFileSync(outPath, renderTemplate(content, vars));
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function renderTemplateFile(
  templatePath: string,
  destPath: string,
  vars: Record<string, string>,
): void {
  const content = fs.readFileSync(templatePath, "utf-8");
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, renderTemplate(content, vars));
}

export interface ScaffoldOptions {
  projectName: string;
  nodeName: string;
  nodeCategory: string;
  nodeColor: string;
  nodeInputs: string;
  nodeOutputs: string;
}

export function scaffoldProject(
  destDir: string,
  templatesDir: string,
  options: ScaffoldOptions,
): void {
  const vars: Record<string, string> = {
    projectName: dashCase(options.projectName),
    nodeName: options.nodeName,
    dashCaseNodeName: dashCase(options.nodeName),
    pascalCaseNodeName: pascalCase(options.nodeName),
    nodeCategory: options.nodeCategory,
    nodeColor: options.nodeColor,
    nodeInputs: options.nodeInputs,
    nodeOutputs: options.nodeOutputs,
  };

  fs.mkdirSync(destDir, { recursive: true });

  // Copy project-level templates (includes directory structure with READMEs)
  copyTemplateDir(path.join(templatesDir, "project"), destDir, vars);

  // Place node-specific files into the correct locations
  const nodeTemplatesDir = path.join(templatesDir, "node");
  const srcDir = path.join(destDir, "src");

  renderTemplateFile(
    path.join(nodeTemplatesDir, "server-node.ts.hbs"),
    path.join(srcDir, "server", "nodes", `${vars.dashCaseNodeName}.ts`),
    vars,
  );

  renderTemplateFile(
    path.join(nodeTemplatesDir, "schema.ts.hbs"),
    path.join(srcDir, "server", "schemas", `${vars.dashCaseNodeName}.ts`),
    vars,
  );

  renderTemplateFile(
    path.join(nodeTemplatesDir, "server-index.ts.hbs"),
    path.join(srcDir, "server", "index.ts"),
    vars,
  );

  renderTemplateFile(
    path.join(nodeTemplatesDir, "labels.json.hbs"),
    path.join(srcDir, "locales", "labels", vars.dashCaseNodeName, "en-US.json"),
    vars,
  );

  renderTemplateFile(
    path.join(nodeTemplatesDir, "docs.md.hbs"),
    path.join(srcDir, "locales", "docs", vars.dashCaseNodeName, "en-US.md"),
    vars,
  );
}
