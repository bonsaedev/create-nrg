import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
  dashCase,
  pascalCase,
  renderTemplate,
  scaffoldProject,
} from "../src/scaffold";

const TEMPLATES_DIR = path.resolve(import.meta.dirname, "../templates");

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "create-nrg-test-"));
}

describe("dashCase", () => {
  it("converts camelCase", () => {
    expect(dashCase("myNodeName")).toBe("my-node-name");
  });

  it("converts spaces", () => {
    expect(dashCase("my node")).toBe("my-node");
  });

  it("converts underscores", () => {
    expect(dashCase("my_node")).toBe("my-node");
  });

  it("lowercases", () => {
    expect(dashCase("MyNode")).toBe("my-node");
  });

  it("keeps already dash-cased strings", () => {
    expect(dashCase("my-node")).toBe("my-node");
  });
});

describe("pascalCase", () => {
  it("converts dash-case", () => {
    expect(pascalCase("my-node")).toBe("MyNode");
  });

  it("converts spaces", () => {
    expect(pascalCase("my node")).toBe("MyNode");
  });

  it("converts single word", () => {
    expect(pascalCase("node")).toBe("Node");
  });
});

describe("renderTemplate", () => {
  it("replaces known variables", () => {
    const result = renderTemplate("Hello {{name}}!", { name: "World" });
    expect(result).toBe("Hello World!");
  });

  it("leaves unknown variables as-is", () => {
    const result = renderTemplate("Hello {{unknown}}!", {});
    expect(result).toBe("Hello {{unknown}}!");
  });

  it("replaces multiple occurrences", () => {
    const result = renderTemplate("{{a}} and {{b}}", { a: "X", b: "Y" });
    expect(result).toBe("X and Y");
  });
});

describe("scaffoldProject", () => {
  let tmpDir: string;
  let projectDir: string;

  const options = {
    projectName: "my-test-project",
    nodeName: "my-node",
    nodeCategory: "test category",
    nodeColor: "#1A1A1A",
    nodeInputs: "1",
    nodeOutputs: "2",
  };

  beforeEach(() => {
    tmpDir = createTmpDir();
    projectDir = path.join(tmpDir, "my-test-project");
    scaffoldProject(projectDir, TEMPLATES_DIR, options);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("project structure", () => {
    it("creates the project directory", () => {
      expect(fs.existsSync(projectDir)).toBe(true);
    });

    it("creates project-level config files", () => {
      const expectedFiles = [
        "package.json",
        "tsconfig.json",
        "vite.config.ts",
        "eslint.config.js",
        ".gitignore",
        ".prettierrc.json",
        "commitlint.config.js",
        "README.md",
      ];

      for (const file of expectedFiles) {
        expect(
          fs.existsSync(path.join(projectDir, file)),
          `${file} should exist`,
        ).toBe(true);
      }
    });

    it("creates .husky hooks", () => {
      expect(
        fs.existsSync(path.join(projectDir, ".husky", "commit-msg")),
      ).toBe(true);
      expect(
        fs.existsSync(path.join(projectDir, ".husky", "pre-commit")),
      ).toBe(true);
    });

    it("creates .vscode extensions recommendation", () => {
      const extensionsPath = path.join(
        projectDir,
        ".vscode",
        "extensions.json",
      );
      expect(fs.existsSync(extensionsPath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(extensionsPath, "utf-8"));
      expect(content.recommendations).toContain("vue.volar");
    });

    it("creates src directory structure with READMEs", () => {
      const dirs = [
        "src/server",
        "src/server/nodes",
        "src/server/schemas",
        "src/client",
        "src/client/nodes",
        "src/client/components",
        "src/client/assets",
        "src/client/public",
        "src/locales",
        "src/locales/labels",
        "src/locales/docs",
        "src/icons",
        "src/examples",
      ];

      for (const dir of dirs) {
        expect(
          fs.existsSync(path.join(projectDir, dir)),
          `${dir} should exist`,
        ).toBe(true);
        expect(
          fs.existsSync(path.join(projectDir, dir, "README.md")),
          `${dir}/README.md should exist`,
        ).toBe(true);
      }
    });

    it("creates client and server tsconfig files", () => {
      expect(
        fs.existsSync(path.join(projectDir, "src/client/tsconfig.json")),
      ).toBe(true);
      expect(
        fs.existsSync(path.join(projectDir, "src/server/tsconfig.json")),
      ).toBe(true);
    });
  });

  describe("node files", () => {
    it("creates the server node file", () => {
      expect(
        fs.existsSync(
          path.join(projectDir, "src/server/nodes/my-node.ts"),
        ),
      ).toBe(true);
    });

    it("creates the schema file", () => {
      expect(
        fs.existsSync(
          path.join(projectDir, "src/server/schemas/my-node.ts"),
        ),
      ).toBe(true);
    });

    it("creates the server index file", () => {
      expect(
        fs.existsSync(path.join(projectDir, "src/server/index.ts")),
      ).toBe(true);
    });

    it("creates the labels file", () => {
      expect(
        fs.existsSync(
          path.join(
            projectDir,
            "src/locales/labels/my-node/en-US.json",
          ),
        ),
      ).toBe(true);
    });

    it("creates the docs file", () => {
      expect(
        fs.existsSync(
          path.join(projectDir, "src/locales/docs/my-node/en-US.md"),
        ),
      ).toBe(true);
    });
  });

  describe("template variable substitution", () => {
    it("substitutes projectName in package.json", () => {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(projectDir, "package.json"), "utf-8"),
      );
      expect(pkg.name).toBe("my-test-project");
    });

    it("substitutes projectName in README.md", () => {
      const readme = fs.readFileSync(
        path.join(projectDir, "README.md"),
        "utf-8",
      );
      expect(readme).toContain("# my-test-project");
    });

    it("substitutes node class name (PascalCase) in server node", () => {
      const content = fs.readFileSync(
        path.join(projectDir, "src/server/nodes/my-node.ts"),
        "utf-8",
      );
      expect(content).toContain("class MyNode extends IONode");
      expect(content).toContain('type: string = "my-node"');
      expect(content).toContain('category: string = "test category"');
      expect(content).toContain('color: `#${string}` = "#1A1A1A"');
      expect(content).toContain("inputs: number = 1");
      expect(content).toContain("outputs: number = 2");
    });

    it("substitutes node class name (PascalCase) in schema", () => {
      const content = fs.readFileSync(
        path.join(projectDir, "src/server/schemas/my-node.ts"),
        "utf-8",
      );
      expect(content).toContain('$id: "MyNodeConfigsSchema"');
      expect(content).toContain('$id: "MyNodeInputSchema"');
      expect(content).toContain('$id: "MyNodeOutputSchema"');
      expect(content).toContain('default: "my-node"');
    });

    it("substitutes node import in server index", () => {
      const content = fs.readFileSync(
        path.join(projectDir, "src/server/index.ts"),
        "utf-8",
      );
      expect(content).toContain('import MyNode from "./nodes/my-node"');
      expect(content).toContain("nodes: [MyNode]");
    });

    it("substitutes node name in labels", () => {
      const labels = JSON.parse(
        fs.readFileSync(
          path.join(
            projectDir,
            "src/locales/labels/my-node/en-US.json",
          ),
          "utf-8",
        ),
      );
      expect(labels.label).toBe("my-node");
    });

    it("substitutes node name in docs", () => {
      const docs = fs.readFileSync(
        path.join(projectDir, "src/locales/docs/my-node/en-US.md"),
        "utf-8",
      );
      expect(docs).toContain("# my-node");
    });
  });

  describe("no leftover template variables", () => {
    function collectFiles(dir: string): string[] {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...collectFiles(fullPath));
        } else {
          results.push(fullPath);
        }
      }
      return results;
    }

    it("no .hbs files remain in the output", () => {
      const files = collectFiles(projectDir);
      const hbsFiles = files.filter((f) => f.endsWith(".hbs"));
      expect(hbsFiles).toEqual([]);
    });

    it("no unreplaced known template variables in text files", () => {
      const knownVars = [
        "projectName",
        "nodeName",
        "dashCaseNodeName",
        "pascalCaseNodeName",
        "nodeCategory",
        "nodeColor",
        "nodeInputs",
        "nodeOutputs",
      ];
      const files = collectFiles(projectDir);
      const textFiles = files.filter(
        (f) =>
          f.endsWith(".ts") ||
          f.endsWith(".json") ||
          f.endsWith(".js") ||
          f.endsWith(".md"),
      );

      for (const file of textFiles) {
        const content = fs.readFileSync(file, "utf-8");
        for (const varName of knownVars) {
          expect(
            content,
            `${path.relative(projectDir, file)} should not contain {{${varName}}}`,
          ).not.toContain(`{{${varName}}}`);
        }
      }
    });
  });
});
