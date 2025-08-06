import { spawn } from 'child_process';
import { resolve } from 'path';
import { type CommandResult, type ExecuteOptions, type CommandConfig } from './types.js';

// 重新导出类型定义
export type { CommandResult, ExecuteOptions, CommandConfig };

/**
 * 在指定目录执行命令
 * @param directory 执行命令的目录路径
 * @param command 要执行的命令
 * @param args 命令参数
 * @param options 执行选项
 * @returns Promise<CommandResult> 命令执行结果
 * 
 * @example
 * ```typescript
 * // 在指定目录执行 ls 命令
 * const result = await executeCommand('/home/user', 'ls', ['-la']);
 * console.log(result.stdout);
 * 
 * // 在指定目录执行 npm install
 * const result = await executeCommand('./my-project', 'npm', ['install']);
 * 
 * // 带超时设置
 * const result = await executeCommand('/path/to/dir', 'git', ['clone', 'repo-url'], {
 *   timeout: 60000 // 60秒超时
 * });
 * ```
 */
export async function executeCommand(
  directory: string,
  command: string,
  args: string[] = [],
  options: ExecuteOptions = {}
): Promise<CommandResult> {
  const startTime = Date.now();
  const absoluteDir = resolve(directory);
  
  const {
    timeout = 30000,
    inheritEnv = true,
    ...spawnOptions
  } = options;

  return new Promise((resolve, reject) => {
    let isResolved = false;
    
    // 设置环境变量
    const env = inheritEnv ? { ...process.env, ...options.env } : options.env;
    
    // 创建子进程
    const childProcess = spawn(command, args, {
      cwd: absoluteDir,
      env,
      ...spawnOptions
    });

    let stdout = '';
    let stderr = '';

    // 收集标准输出
    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
    }

    // 收集错误输出
    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    // 设置超时
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        childProcess.kill('SIGTERM');
        
        // 如果 SIGTERM 不起作用，强制终止
        setTimeout(() => {
          if (!childProcess.killed) {
            childProcess.kill('SIGKILL');
          }
        }, 5000);
        
        reject(new Error(`命令执行超时 (${timeout}ms): ${command} ${args.join(' ')}`));
      }
    }, timeout);

    // 处理进程退出
    childProcess.on('close', (code) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        
        const duration = Date.now() - startTime;
        const result: CommandResult = {
          code: code || 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          duration
        };
        
        resolve(result);
      }
    });

    // 处理进程错误
    childProcess.on('error', (error) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        reject(new Error(`命令执行失败: ${error.message}`));
      }
    });
  });
}

/**
 * 在指定目录执行命令的简化版本（仅返回标准输出）
 * @param directory 执行命令的目录路径
 * @param command 要执行的命令
 * @param args 命令参数
 * @param options 执行选项
 * @returns Promise<string> 命令的标准输出
 * 
 * @example
 * ```typescript
 * // 获取目录列表
 * const files = await executeCommandSimple('/home/user', 'ls', ['-la']);
 * console.log(files);
 * ```
 */
export async function executeCommandSimple(
  directory: string,
  command: string,
  args: string[] = [],
  options: ExecuteOptions = {}
): Promise<string> {
  const result = await executeCommand(directory, command, args, options);
  
  if (result.code !== 0) {
    throw new Error(`命令执行失败 (退出代码: ${result.code}): ${result.stderr || result.stdout}`);
  }
  
  return result.stdout;
}

/**
 * 在指定目录执行多个命令
 * @param directory 执行命令的目录路径
 * @param commands 命令列表，每个命令包含 command 和 args
 * @param options 执行选项
 * @returns Promise<CommandResult[]> 所有命令的执行结果
 * 
 * @example
 * ```typescript
 * const results = await executeMultipleCommands('/path/to/project', [
 *   { command: 'npm', args: ['install'] },
 *   { command: 'npm', args: ['run', 'build'] },
 *   { command: 'npm', args: ['test'] }
 * ]);
 * ```
 */
export async function executeMultipleCommands(
  directory: string,
  commands: CommandConfig[],
  options: ExecuteOptions = {}
): Promise<CommandResult[]> {
  const results: CommandResult[] = [];
  
  for (const cmd of commands) {
    const result = await executeCommand(
      directory, 
      cmd.command, 
      cmd.args || [], 
      options
    );
    results.push(result);
    
    // 如果某个命令失败且没有设置继续执行，则停止
    if (result.code !== 0 && !options.detached) {
      break;
    }
  }
  
  return results;
}
