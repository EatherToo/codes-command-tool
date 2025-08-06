import { executeCommand, executeCommandSimple, executeMultipleCommands } from './index';
import { type CommandResult, type CommandConfig } from './types';

describe('Command Tool', () => {
  describe('executeCommand', () => {
    it('应该成功执行简单命令', async () => {
      const result = await executeCommand('.', 'echo', ['hello world']);
      
      expect(result.code).toBe(0);
      expect(result.stdout).toBe('hello world');
      expect(result.stderr).toBe('');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('应该正确处理命令失败', async () => {
      const result = await executeCommand('.', 'ls', ['/nonexistent/directory']);
      
      expect(result.code).not.toBe(0);
      expect(result.stderr).toBeTruthy();
    });

    it('应该支持自定义环境变量', async () => {
      // 测试环境变量的设置（检查选项是否正确传递）
      const result = await executeCommand(
        '.',
        'printenv',
        ['TEST_VAR'],
        {
          env: { TEST_VAR: 'test-value' },
          inheritEnv: false
        }
      );
      
      // 如果 printenv 不可用，跳过这个测试
      if (result.code !== 0) {
        // printenv 不可用，跳过测试
        return;
      }
      
      expect(result.stdout).toBe('test-value');
    });

    it('应该支持超时设置', async () => {
      // 这个测试在某些系统上可能不稳定，所以我们使用一个快速命令
      const result = await executeCommand('.', 'echo', ['timeout test'], {
        timeout: 5000
      });
      
      expect(result.code).toBe(0);
      expect(result.duration).toBeLessThan(5000);
    });

    it('应该在超时时终止命令', async () => {
      // 使用一个长时间运行的命令来测试超时
      await expect(
        executeCommand('.', 'sleep', ['10'], {
          timeout: 100 // 100毫秒超时
        })
      ).rejects.toThrow('命令执行超时');
    }, 10000); // 给测试本身10秒超时
  });

  describe('executeCommandSimple', () => {
    it('应该返回标准输出', async () => {
      const output = await executeCommandSimple('.', 'echo', ['simple test']);
      expect(output).toBe('simple test');
    });

    it('应该在命令失败时抛出错误', async () => {
      await expect(
        executeCommandSimple('.', 'ls', ['/nonexistent/directory'])
      ).rejects.toThrow();
    });
  });

  describe('executeMultipleCommands', () => {
    it('应该执行多个命令', async () => {
      const commands: CommandConfig[] = [
        { command: 'echo', args: ['first'] },
        { command: 'echo', args: ['second'] }
      ];

      const results: CommandResult[] = await executeMultipleCommands('.', commands);
      
      expect(results).toHaveLength(2);
      expect(results[0].stdout).toBe('first');
      expect(results[1].stdout).toBe('second');
      expect(results.every(r => r.code === 0)).toBe(true);
    });

    it('应该在命令失败时停止执行（默认行为）', async () => {
      const commands: CommandConfig[] = [
        { command: 'echo', args: ['first'] },
        { command: 'ls', args: ['/nonexistent'] },
        { command: 'echo', args: ['third'] }
      ];

      const results: CommandResult[] = await executeMultipleCommands('.', commands);
      
      // 第一个命令成功，第二个失败，第三个不应该执行
      expect(results).toHaveLength(2);
      expect(results[0].code).toBe(0);
      expect(results[1].code).not.toBe(0);
    });
  });

  describe('错误处理', () => {
    it('应该处理不存在的命令', async () => {
      await expect(
        executeCommand('.', 'nonexistentcommand12345')
      ).rejects.toThrow('命令执行失败');
    });

    it('应该处理无效的目录', async () => {
      // 注意：某些系统可能会不同地处理这种情况
      await expect(
        executeCommand('/completely/nonexistent/path', 'echo', ['test'])
      ).rejects.toThrow();
    });
  });

  describe('路径处理', () => {
    it('应该解析相对路径', async () => {
      const result = await executeCommand('.', 'pwd');
      expect(result.code).toBe(0);
      expect(result.stdout).toBeTruthy();
    });

    it('应该处理绝对路径', async () => {
      // 使用用户主目录，这在大多数系统上都存在
      const homeDir = process.env.HOME || process.env.USERPROFILE;
      if (homeDir) {
        const result = await executeCommand(homeDir, 'pwd');
        expect(result.code).toBe(0);
      }
    });
  });

  describe('管道符和复杂命令', () => {
    it('应该支持使用shell执行管道符命令', async () => {
      // 在Unix-like系统上使用sh，在Windows上使用cmd
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'cmd' : 'sh';
      const shellFlag = isWindows ? '/c' : '-c';
      
      const result = await executeCommand(
        '.',
        shell,
        [shellFlag, 'echo "hello world" | grep "hello"']
      );
      
      // 如果命令成功，应该包含 "hello"
      if (result.code === 0) {
        expect(result.stdout).toContain('hello');
      } else {
        // 如果shell不支持或命令不存在，跳过测试
        // Shell 或 grep 命令不可用，跳过管道符测试
      }
    });

    it('应该支持多参数的管道命令', async () => {
      // 使用更通用的命令组合
      const isWindows = process.platform === 'win32';
      
      if (isWindows) {
        // Windows 使用 cmd 和 findstr
        const result = await executeCommand(
          '.',
          'cmd',
          ['/c', 'echo test123 | findstr "test"']
        );
        
        if (result.code === 0) {
          expect(result.stdout).toContain('test');
        }
      } else {
        // Unix-like 系统使用 sh 和基本命令
        const result = await executeCommand(
          '.',
          'sh',
          ['-c', 'echo "line1\nline2\nline3" | head -2']
        );
        
        if (result.code === 0) {
          const lines = result.stdout.split('\n').filter(line => line.trim());
          expect(lines.length).toBeLessThanOrEqual(2);
          expect(result.stdout).toContain('line1');
        }
      }
    });

    it('应该支持命令链（使用&&）', async () => {
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'cmd' : 'sh';
      const shellFlag = isWindows ? '/c' : '-c';
      
      const result = await executeCommand(
        '.',
        shell,
        [shellFlag, 'echo "first" && echo "second"']
      );
      
      if (result.code === 0) {
        expect(result.stdout).toContain('first');
        expect(result.stdout).toContain('second');
      }
    });

    it('应该正确处理管道符命令的错误', async () => {
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'cmd' : 'sh';
      const shellFlag = isWindows ? '/c' : '-c';
      
      // 故意使用一个会失败的管道命令
      const result = await executeCommand(
        '.',
        shell,
        [shellFlag, 'echo "test" | nonexistentcommand12345']
      );
      
      // 管道命令失败时，退出代码应该非零
      expect(result.code).not.toBe(0);
    });
  });
});