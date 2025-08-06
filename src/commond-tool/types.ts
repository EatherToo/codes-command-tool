import { type SpawnOptionsWithoutStdio } from 'child_process';

/**
 * 命令执行结果接口
 */
export interface CommandResult {
  /** 退出代码 */
  code: number;
  /** 标准输出 */
  stdout: string;
  /** 标准错误输出 */
  stderr: string;
  /** 执行时间（毫秒） */
  duration: number;
}

/**
 * 命令执行选项
 */
export interface ExecuteOptions extends Omit<SpawnOptionsWithoutStdio, 'cwd'> {
  /** 超时时间（毫秒），默认 30000ms */
  timeout?: number;
  /** 是否继承当前进程的环境变量，默认 true */
  inheritEnv?: boolean;
}

/**
 * 多命令执行时的单个命令配置
 */
export interface CommandConfig {
  /** 要执行的命令 */
  command: string;
  /** 命令参数 */
  args?: string[];
}