# Codes Command Tool

一个强大的 Node.js 命令执行工具库，支持在指定目录执行命令，提供完整的类型定义和错误处理。

## ✨ 主要特性

- 🚀 **指定目录执行**: 在任意目录执行命令，无需切换工作目录
- 📝 **完整类型支持**: 使用 TypeScript 编写，提供完整的类型定义
- ⚡ **异步/同步**: 基于 Promise 的 API，支持 async/await
- 🔧 **丰富选项**: 支持超时、环境变量、进程选项等配置
- 📊 **详细结果**: 返回退出代码、输出、错误信息和执行时间
- 🎯 **多种模式**: 提供基础模式、简化模式和批量执行模式
- 🛡️ **错误处理**: 完善的错误处理和超时机制

## 🚀 快速开始

### 安装

```bash
npm install codes-command-tool
# 或
pnpm add codes-command-tool
# 或
yarn add codes-command-tool
```

### 基础用法

```typescript
import { executeCommand, executeCommandSimple } from 'codes-command-tool';

// 基础用法：在指定目录执行命令
const result = await executeCommand('/path/to/directory', 'ls', ['-la']);
console.log('退出代码:', result.code);
console.log('输出:', result.stdout);
console.log('执行时间:', result.duration, 'ms');

// 简化用法：直接获取输出
const output = await executeCommandSimple('/path/to/directory', 'pwd');
console.log('当前目录:', output);
```

### 高级用法

```typescript
import { executeCommand, executeMultipleCommands } from 'codes-command-tool';

// 带选项的执行
const result = await executeCommand(
  './my-project',
  'npm',
  ['install'],
  {
    timeout: 60000,        // 60秒超时
    env: { NODE_ENV: 'production' },  // 自定义环境变量
    inheritEnv: true       // 继承当前环境变量
  }
);

// 批量执行命令
const results = await executeMultipleCommands('/path/to/project', [
  { command: 'npm', args: ['install'] },
  { command: 'npm', args: ['run', 'build'] },
  { command: 'npm', args: ['test'] }
]);
```

## 📚 API 文档

### executeCommand

在指定目录执行命令的主要函数。

```typescript
function executeCommand(
  directory: string,
  command: string,
  args?: string[],
  options?: ExecuteOptions
): Promise<CommandResult>
```

**参数:**

- `directory` - 执行命令的目录路径（相对或绝对路径）
- `command` - 要执行的命令
- `args` - 命令参数数组（可选）
- `options` - 执行选项（可选）

**返回:**

```typescript
interface CommandResult {
  code: number;      // 退出代码
  stdout: string;    // 标准输出
  stderr: string;    // 标准错误输出
  duration: number;  // 执行时间（毫秒）
}
```

### executeCommandSimple

简化版本，仅返回标准输出，失败时抛出异常。

```typescript
function executeCommandSimple(
  directory: string,
  command: string,
  args?: string[],
  options?: ExecuteOptions
): Promise<string>
```

### executeMultipleCommands

在指定目录执行多个命令。

```typescript
function executeMultipleCommands(
  directory: string,
  commands: { command: string; args?: string[] }[],
  options?: ExecuteOptions
): Promise<CommandResult[]>
```

### ExecuteOptions

```typescript
interface ExecuteOptions {
  timeout?: number;        // 超时时间（毫秒），默认 30000
  inheritEnv?: boolean;    // 是否继承当前环境变量，默认 true
  env?: NodeJS.ProcessEnv; // 自定义环境变量
  // ... 其他 Node.js spawn 选项
}
```

## 💡 使用示例

### 基础文件操作

```typescript
import { executeCommand, executeCommandSimple } from 'codes-command-tool';

// 列出目录文件
const result = await executeCommand('/home/user', 'ls', ['-la']);
console.log(result.stdout);

// 获取当前目录
const pwd = await executeCommandSimple('.', 'pwd');
console.log('当前目录:', pwd);

// 创建目录
await executeCommand('/tmp', 'mkdir', ['my-folder']);
```

### Git 操作

```typescript
// 检查 Git 状态
const gitResult = await executeCommand('./my-repo', 'git', ['status']);
if (gitResult.code === 0) {
  console.log('Git 状态:', gitResult.stdout);
}

// 获取当前分支
const branch = await executeCommandSimple('./my-repo', 'git', [
  'branch', '--show-current'
]);
console.log('当前分支:', branch);
```

### 项目构建

```typescript
// Node.js 项目构建流程
const buildCommands = [
  { command: 'npm', args: ['install'] },
  { command: 'npm', args: ['run', 'lint'] },
  { command: 'npm', args: ['run', 'test'] },
  { command: 'npm', args: ['run', 'build'] }
];

const results = await executeMultipleCommands('./my-project', buildCommands, {
  timeout: 300000 // 5分钟超时
});

const success = results.every(result => result.code === 0);
console.log('构建', success ? '成功' : '失败');
```

### 错误处理

```typescript
try {
  const result = await executeCommand('/nonexistent', 'ls');
} catch (error) {
  console.error('命令执行失败:', error.message);
}

// 或者检查退出代码
const result = await executeCommand('.', 'ls', ['/nonexistent']);
if (result.code !== 0) {
  console.error('命令失败:', result.stderr);
}
```

## ⚠️ 注意事项

### 安全考虑

- 谨慎处理用户输入，避免命令注入攻击
- 不要执行不受信任的命令
- 使用参数数组而不是字符串拼接来避免 shell 注入

```typescript
// ✅ 安全：使用参数数组
await executeCommand('/path', 'ls', ['-la', userInput]);

// ❌ 不安全：避免字符串拼接
// await executeCommand('/path', `ls -la ${userInput}`);
```

### 平台兼容性

- 该库在 Windows、macOS 和 Linux 上都可正常工作
- 命令需要在目标系统上可用
- Windows 上建议使用 PowerShell 或 Git Bash

### 性能考虑

- 大量并发执行可能消耗系统资源
- 合理设置超时时间
- 考虑使用 `executeMultipleCommands` 串行执行相关命令

## 🎯 最佳实践

### 错误处理

```typescript
// 推荐：明确处理错误情况
try {
  const result = await executeCommand('./project', 'npm', ['test']);
  if (result.code !== 0) {
    console.error('测试失败:', result.stderr);
    process.exit(1);
  }
} catch (error) {
  console.error('执行错误:', error.message);
  process.exit(1);
}
```

### 路径处理

```typescript
import { resolve } from 'path';

// 推荐：使用绝对路径
const projectPath = resolve('./my-project');
await executeCommand(projectPath, 'npm', ['install']);

// 或使用相对路径（相对于当前工作目录）
await executeCommand('./my-project', 'npm', ['install']);
```

### 环境变量管理

```typescript
// 推荐：明确设置所需的环境变量
await executeCommand('./project', 'npm', ['run', 'build'], {
  env: {
    NODE_ENV: 'production',
    CI: 'true'
  },
  inheritEnv: true  // 继承其他环境变量
});
```

## 🔧 开发和构建

如果您想要参与开发或自定义构建：

```bash
# 克隆项目
git clone <repository-url>
cd codes-command-tool

# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建
pnpm run build

# 运行测试
pnpm run test

# 代码检查
pnpm run lint
```

## 🐛 常见问题

### Q: 如何处理长时间运行的命令？

A: 使用 `timeout` 选项设置合适的超时时间，或设置为 `0` 禁用超时：

```typescript
await executeCommand('./project', 'npm', ['install'], {
  timeout: 0 // 禁用超时
});
```

### Q: 如何在 Windows 上使用？

A: 确保使用正确的命令名称。Windows 上某些命令可能需要 `.exe` 后缀：

```typescript
// Windows 上可能需要
await executeCommand('.', 'npm.exe', ['--version']);

// 或使用 PowerShell
await executeCommand('.', 'powershell', ['-Command', 'Get-Location']);
```

### Q: 如何处理需要交互输入的命令？

A: 这个库不支持交互式命令。请使用非交互式标志或预先配置所需的输入：

```typescript
// 使用非交互式标志
await executeCommand('.', 'npm', ['install', '--yes']);
```

### Q: 如何获取实时输出？

A: 当前版本在命令执行完成后才返回结果。如果需要实时输出，可以直接使用 Node.js 的 `spawn` API。

### Q: 命令执行失败但没有抛出错误？

A: `executeCommand` 不会因为非零退出代码而抛出错误。请检查 `result.code`：

```typescript
const result = await executeCommand('.', 'false'); // 总是返回退出代码 1
if (result.code !== 0) {
  console.error('命令失败');
}

// 或使用 executeCommandSimple，它会在失败时抛出错误
try {
  await executeCommandSimple('.', 'false');
} catch (error) {
  console.error('命令失败:', error.message);
}
```

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具库！

### 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

---

**提示**: 这个库为您提供了安全、可靠的命令执行能力，让您专注于业务逻辑而不用担心底层实现！

