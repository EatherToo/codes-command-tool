import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { readFileContent, readTextFile, safeReadFileContent } from './read-file-content';

// 测试目录
const TEST_DIR = join(__dirname, '../../test-files');

describe('读取文件内容功能测试', () => {
  // 在测试前创建测试目录和文件
  beforeAll(async () => {
    try {
      await mkdir(TEST_DIR, { recursive: true });
      
      // 创建测试文本文件
      await writeFile(join(TEST_DIR, 'test.txt'), 'Hello World\n测试中文\n第三行');
      
      // 创建测试 JSON 文件
      await writeFile(
        join(TEST_DIR, 'test.json'), 
        JSON.stringify({ name: '测试', value: 123 }, null, 2)
      );
      
      // 创建测试 JavaScript 文件
      await writeFile(
        join(TEST_DIR, 'test.js'),
        'console.log("Hello World");\n// 这是注释\nconst x = 42;'
      );
      
      // 创建二进制文件（PNG 文件头）
      const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
      await writeFile(join(TEST_DIR, 'test.png'), pngHeader);
      
      // 创建大文件（超过默认限制）
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      await writeFile(join(TEST_DIR, 'large.txt'), largeContent);
      
    } catch {
      // 创建测试文件失败，测试将跳过
    }
  });

  // 在测试后清理测试目录
  afterAll(async () => {
    try {
      await rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // 清理测试文件失败，忽略错误
    }
  });

  describe('readFileContent 基本功能', () => {
    test('应该能读取文本文件', async () => {
      const result = await readFileContent(join(TEST_DIR, 'test.txt'));
      
      expect(result.name).toBe('test.txt');
      expect(result.extension).toBe('.txt');
      expect(result.isText).toBe(true);
      expect(result.encoding).toBe('utf8');
      expect(result.content).toBe('Hello World\n测试中文\n第三行');
      expect(result.lineCount).toBe(3);
      expect(result.size).toBeGreaterThan(0);
      expect(typeof result.lastModified).toBe('object');
      expect(result.lastModified).toBeTruthy();
    });

    test('应该能读取 JSON 文件', async () => {
      const result = await readFileContent(join(TEST_DIR, 'test.json'));
      
      expect(result.name).toBe('test.json');
      expect(result.extension).toBe('.json');
      expect(result.isText).toBe(true);
      expect(result.encoding).toBe('utf8');
      expect(typeof result.content).toBe('string');
      
      // 验证 JSON 内容可以解析
      const parsed = JSON.parse(result.content as string);
      expect(parsed.name).toBe('测试');
      expect(parsed.value).toBe(123);
    });

    test('应该能读取 JavaScript 文件', async () => {
      const result = await readFileContent(join(TEST_DIR, 'test.js'));
      
      expect(result.name).toBe('test.js');
      expect(result.extension).toBe('.js');
      expect(result.isText).toBe(true);
      expect(result.encoding).toBe('utf8');
      expect(result.content).toContain('console.log');
      expect(result.content).toContain('const x = 42');
      expect(result.lineCount).toBe(3);
    });

    test('应该能检测二进制文件', async () => {
      const result = await readFileContent(join(TEST_DIR, 'test.png'));
      
      expect(result.name).toBe('test.png');
      expect(result.extension).toBe('.png');
      expect(result.isText).toBe(false);
      expect(result.encoding).toBe('binary');
      expect(result.content).toBeInstanceOf(Buffer);
      expect(result.lineCount).toBeUndefined();
    });
  });

  describe('readFileContent 选项测试', () => {
    test('应该能使用不同的编码', async () => {
      const result = await readFileContent(join(TEST_DIR, 'test.txt'), {
        encoding: 'ascii'
      });
      
      expect(result.encoding).toBe('ascii');
      expect(typeof result.content).toBe('string');
    });

    test('应该能禁用类型检测', async () => {
      const result = await readFileContent(join(TEST_DIR, 'test.png'), {
        detectType: false
      });
      
      expect(result.isText).toBe(true);
      expect(result.encoding).toBe('utf8');
      expect(typeof result.content).toBe('string');
    });

    test('应该能设置文件大小限制', async () => {
      await expect(
        readFileContent(join(TEST_DIR, 'large.txt'), {
          maxSize: 1024 // 1KB 限制
        })
      ).rejects.toThrow('文件大小');
    });
  });

  describe('readTextFile 功能', () => {
    test('应该能读取文本文件', async () => {
      const content = await readTextFile(join(TEST_DIR, 'test.txt'));
      
      expect(typeof content).toBe('string');
      expect(content).toBe('Hello World\n测试中文\n第三行');
    });

    test('应该拒绝读取二进制文件', async () => {
      await expect(
        readTextFile(join(TEST_DIR, 'test.png'))
      ).rejects.toThrow('不是文本文件');
    });
  });

  describe('safeReadFileContent 功能', () => {
    test('应该能安全读取存在的文件', async () => {
      const result = await safeReadFileContent(join(TEST_DIR, 'test.txt'));
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe('test.txt');
    });

    test('应该返回 null 当文件不存在', async () => {
      const result = await safeReadFileContent(join(TEST_DIR, 'not-exists.txt'));
      
      expect(result).toBeNull();
    });
  });

  describe('错误处理', () => {
    test('应该抛出错误当文件不存在', async () => {
      await expect(
        readFileContent(join(TEST_DIR, 'not-exists.txt'))
      ).rejects.toThrow('读取文件失败');
    });

    test('应该抛出错误当路径是目录', async () => {
      await expect(
        readFileContent(TEST_DIR)
      ).rejects.toThrow('不是一个有效的文件');
    });
  });
});
