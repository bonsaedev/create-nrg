<p align="center">
  <img alt="nrg-icon" src="https://gist.githubusercontent.com/AllanOricil/84412df273de46b28c5d6945b391afd4/raw/0c9cdb994c40ab3d7b7ad06dcee162145d77d531/nrg-icon.svg" style="width: 200px"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@bonsae/create-nrg"><img src="https://img.shields.io/npm/v/@bonsae/create-nrg.svg" alt="npm package"></a>
  <a href="https://github.com/bonsaedev/create-nrg/actions/workflows/ci.yaml"><img src="https://github.com/bonsaedev/create-nrg/actions/workflows/ci.yaml/badge.svg?branch=main" alt="build status"></a>
</p>

# create-nrg

Scaffold a new [NRG](https://github.com/bonsaedev/nrg) project for Node-RED.

## Usage

```bash
pnpm create @bonsae/nrg my-project
```

```bash
npm create @bonsae/nrg my-project
```

```bash
npx @bonsae/create-nrg my-project
```

The CLI will prompt you for:

- **Project name**
- **First node name**
- **Node category**
- **Node color** (hex, default `#1A1A1A`)
- **Node inputs** (0 or 1)
- **Node outputs**

## Generated project structure

```
my-project/
├── .vscode/extensions.json
├── .husky/
├── .gitignore
├── .prettierrc.json
├── eslint.config.js
├── commitlint.config.js
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── server/
    │   ├── index.ts
    │   ├── nodes/<node>.ts
    │   ├── schemas/<node>.ts
    │   └── tsconfig.json
    ├── locales/
    │   ├── labels/<node>/en-US.json
    │   └── docs/<node>/en-US.md
    ├── icons/
    └── examples/
```

## License

MIT
