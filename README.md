# Node.js Library Scaffold

一个现代化的 Node.js 库脚手架项目，提供完整的开发工具链配置，帮助您快速创建高质量的 TypeScript 库。

## ✨ 脚手架特性

- 🚀 **现代化构建工具**: 预配置 Rollup + tsup 双格式打包 (ESM + CommonJS)
- 📝 **TypeScript 支持**: 完整的类型定义和严格模式配置
- 🧪 **测试框架**: Jest 测试框架，支持代码覆盖率
- 📚 **文档生成**: TypeDoc 自动生成 API 文档
- 🔧 **代码质量**: oxlint + Prettier 代码格式化和检查
- 📦 **多格式输出**: 支持 ESM 和 CommonJS 两种模块格式
- 🎯 **开箱即用**: 所有配置都已预设，无需额外配置

## 🚀 快速开始

### 1. 克隆脚手架

```bash
git clone <your-scaffold-repo-url> my-library
cd my-library
```

### 2. 初始化项目

```bash
# 安装依赖
pnpm install

# 清理示例代码（可选）
rm -rf src/*
# 然后添加您自己的代码
```

### 3. 修改项目信息

编辑 `package.json` 文件：

```json
{
  "name": "your-library-name",
  "version": "1.0.0",
  "description": "Your library description",
  "author": "Your Name",
  "license": "MIT"
}
```

### 4. 开始开发

```bash
# 开发模式（监听文件变化）
pnpm run dev

# 构建项目
pnpm run build

# 运行测试
pnpm run test
```

## 🛠️ 脚手架结构

```
project-root/
├── src/                    # 源代码目录
│   ├── index.ts           # 主入口文件
│   ├── index.test.ts      # 主模块测试
│   └── utils/             # 工具函数目录
│       ├── index.ts       # 工具函数实现
│       └── index.test.ts  # 工具函数测试
├── dist/                  # 构建输出目录
├── docs/                  # 文档输出目录
├── scripts/               # 构建脚本
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── rollup.config.js       # Rollup 打包配置
├── tsup.config.ts         # tsup 配置
├── jest.config.js         # Jest 测试配置
├── typedoc.json           # TypeDoc 文档配置
└── README.md              # 项目说明
```

## 📋 可用脚本

### 构建相关

```bash
# 完整构建（Rollup + tsup）
pnpm run build

# 仅 Rollup 构建
pnpm run build:rollup

# 仅生成类型声明
pnpm run build:types

# 开发模式（监听文件变化）
pnpm run dev

# 清理构建文件
pnpm run clean
```

### 测试相关

```bash
# 运行测试
pnpm run test

# 测试监听模式
pnpm run test:watch

# 生成测试覆盖率报告
pnpm run test:coverage

# CI 环境测试
pnpm run test:ci
```

### 代码质量

```bash
# 代码检查
pnpm run lint

# 代码检查并自动修复
pnpm run lint:fix

# 代码格式化
pnpm run format

# 检查代码格式
pnpm run format:check
```

### 文档生成

```bash
# 生成文档
pnpm run docs

# 生成文档并启动本地服务器
pnpm run docs:serve
```

## ⚙️ 配置说明

### TypeScript 配置 (`tsconfig.json`)

脚手架使用严格的 TypeScript 配置：

- 目标: ES2020
- 模块: ESNext
- 严格模式: 启用所有严格检查
- 声明文件: 自动生成
- 源码映射: 启用

### 构建配置

#### Rollup 配置 (`rollup.config.js`)
- 生成 ESM 和 CommonJS 双格式
- 自动排除 Node.js 内置模块
- 支持源码映射

#### tsup 配置 (`tsup.config.ts`)
- 生成 TypeScript 声明文件
- 目标: ES2020
- 清理输出目录

### 测试配置 (`jest.config.js`)

- 支持 TypeScript 和 ESM
- 代码覆盖率阈值: 80%
- 生成 HTML 覆盖率报告
- 自动清理模拟

### 文档配置 (`typedoc.json`)

- 自动生成 API 文档
- 包含版本信息
- 排除私有成员
- 支持搜索功能

## 📦 发布准备

### 1. 更新版本号

```bash
# 使用 npm version 或手动编辑 package.json
npm version patch  # 或 minor, major
```

### 2. 构建和测试

```bash
# 清理并重新构建
pnpm run clean
pnpm run build

# 运行测试
pnpm run test:ci
```

### 3. 发布

```bash
# 发布到 npm（会自动运行 prepublishOnly 脚本）
pnpm publish
```

## 🔧 自定义配置

### 添加新的依赖

```bash
# 生产依赖
pnpm add <package-name>

# 开发依赖
pnpm add -D <package-name>
```

### 修改构建配置

编辑 `rollup.config.js` 或 `tsup.config.ts` 来自定义构建行为。

### 添加新的脚本

在 `package.json` 的 `scripts` 部分添加自定义脚本。

## 🎯 最佳实践

### 代码组织

1. **模块化**: 将功能分解为小的、可测试的模块
2. **类型安全**: 充分利用 TypeScript 的类型系统
3. **测试覆盖**: 为所有公共 API 编写测试
4. **文档**: 使用 JSDoc 注释文档化 API

### 开发流程

1. 编写代码和测试
2. 运行 `pnpm run lint` 检查代码质量
3. 运行 `pnpm run test` 确保测试通过
4. 运行 `pnpm run build` 验证构建
5. 提交代码

### 发布流程

1. 更新版本号
2. 运行完整测试套件
3. 构建项目
4. 生成文档
5. 发布到 npm

## 🐛 常见问题

### Q: 如何添加新的工具函数？

A: 在 `src/utils/` 目录下创建新文件，并在 `src/utils/index.ts` 中导出。

### Q: 如何修改构建输出格式？

A: 编辑 `rollup.config.js` 文件中的 `output.format` 配置。

### Q: 如何添加新的测试？

A: 创建 `.test.ts` 文件，Jest 会自动发现并运行。

### Q: 如何自定义文档生成？

A: 编辑 `typedoc.json` 文件中的配置选项。

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个脚手架！

---

**提示**: 这个脚手架为您提供了完整的开发环境，您只需要专注于编写业务逻辑即可！

