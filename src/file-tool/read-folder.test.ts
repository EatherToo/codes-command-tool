import { mkdtemp, writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFolder, formatFileTree } from './read-folder';
import { FileType } from './types';

describe('readFolder', () => {
  let tempDir: string;

  beforeEach(async () => {
    // 创建临时目录
    tempDir = await mkdtemp(join(tmpdir(), 'test-read-folder-'));
  });

  afterEach(async () => {
    // 清理临时目录
    await rm(tempDir, { recursive: true, force: true });
  });

  it('应该能读取空目录', async () => {
    const result = await readFolder(tempDir);
    
    expect(result.root.type).toBe(FileType.DIRECTORY);
    expect(result.root.children).toEqual([]);
    expect(result.totalFiles).toBe(0);
    expect(result.totalDirectories).toBe(0);
    expect(result.totalSize).toBe(0);
  });

  it('应该能读取包含文件的目录', async () => {
    // 创建测试文件
    const testContent = 'Hello, World!';
    await writeFile(join(tempDir, 'test.txt'), testContent);
    await writeFile(join(tempDir, 'readme.md'), '# README');

    const result = await readFolder(tempDir);
    
    expect(result.root.children).toHaveLength(2);
    expect(result.totalFiles).toBe(2);
    expect(result.totalDirectories).toBe(0);
    expect(result.totalSize).toBeGreaterThan(0);

    // 检查文件信息
    const files = result.root.children ?? [];
    expect(files.some(f => f.name === 'test.txt' && f.type === FileType.FILE)).toBe(true);
    expect(files.some(f => f.name === 'readme.md' && f.type === FileType.FILE)).toBe(true);
  });

  it('应该能递归读取子目录', async () => {
    // 创建子目录结构
    const subDir = join(tempDir, 'subdir');
    await mkdir(subDir);
    await writeFile(join(subDir, 'nested.txt'), 'nested content');
    await writeFile(join(tempDir, 'root.txt'), 'root content');

    const result = await readFolder(tempDir);
    
    expect(result.root.children).toHaveLength(2);
    expect(result.totalFiles).toBe(2);
    expect(result.totalDirectories).toBe(1);

    // 查找子目录
    const subdirInfo = result.root.children?.find(f => f.name === 'subdir');
    expect(subdirInfo).toBeDefined();
    expect(subdirInfo?.type).toBe(FileType.DIRECTORY);
    expect(subdirInfo?.children).toHaveLength(1);
    expect(subdirInfo?.children?.[0].name).toBe('nested.txt');
  });

  it('应该能控制递归深度', async () => {
    // 创建深层目录结构
    const level1 = join(tempDir, 'level1');
    const level2 = join(level1, 'level2');
    await mkdir(level1);
    await mkdir(level2);
    await writeFile(join(level2, 'deep.txt'), 'deep content');

    // 限制深度为1
    const result = await readFolder(tempDir, { maxDepth: 1 });
    
    const level1Dir = result.root.children?.find(f => f.name === 'level1');
    expect(level1Dir).toBeDefined();
    expect(level1Dir?.children).toHaveLength(0); // 因为深度限制，不应该读取level2
  });

  it('应该能过滤隐藏文件', async () => {
    // 创建隐藏文件
    await writeFile(join(tempDir, '.hidden'), 'hidden content');
    await writeFile(join(tempDir, 'visible.txt'), 'visible content');

    // 默认不包含隐藏文件
    const result1 = await readFolder(tempDir);
    expect(result1.root.children).toHaveLength(1);
    expect(result1.root.children?.[0].name).toBe('visible.txt');

    // 包含隐藏文件
    const result2 = await readFolder(tempDir, { includeHidden: true });
    expect(result2.root.children).toHaveLength(2);
    const fileNames = result2.root.children?.map(f => f.name) ?? [];
    expect(fileNames).toContain('.hidden');
    expect(fileNames).toContain('visible.txt');
  });

  it('应该能应用自定义过滤器', async () => {
    // 创建不同类型的文件
    await writeFile(join(tempDir, 'file.txt'), 'text content');
    await writeFile(join(tempDir, 'file.js'), 'js content');
    await writeFile(join(tempDir, 'file.md'), 'md content');

    // 只包含 .txt 文件
    const result = await readFolder(tempDir, {
      filter: (file) => file.name.endsWith('.txt') || file.type === FileType.DIRECTORY
    });

    expect(result.root.children).toHaveLength(1);
    expect(result.root.children?.[0].name).toBe('file.txt');
  });

  it('应该能关闭递归', async () => {
    // 创建子目录
    const subDir = join(tempDir, 'subdir');
    await mkdir(subDir);
    await writeFile(join(subDir, 'nested.txt'), 'nested content');

    const result = await readFolder(tempDir, { recursive: false });
    
    const subdirInfo = result.root.children?.find(f => f.name === 'subdir');
    expect(subdirInfo).toBeDefined();
    expect(subdirInfo?.children).toBeUndefined();
  });

  it('应该正确计算统计信息', async () => {
    // 创建复杂的目录结构
    const subDir1 = join(tempDir, 'sub1');
    const subDir2 = join(tempDir, 'sub2');
    await mkdir(subDir1);
    await mkdir(subDir2);
    
    await writeFile(join(tempDir, 'root1.txt'), 'content1');
    await writeFile(join(tempDir, 'root2.txt'), 'content2');
    await writeFile(join(subDir1, 'sub1.txt'), 'subcontent1');
    await writeFile(join(subDir2, 'sub2.txt'), 'subcontent2');

    const result = await readFolder(tempDir);
    
    expect(result.totalFiles).toBe(4);
    expect(result.totalDirectories).toBe(2);
    expect(result.totalSize).toBeGreaterThan(0);
  });

  it('应该在路径不是目录时抛出错误', async () => {
    const filePath = join(tempDir, 'not-a-dir.txt');
    await writeFile(filePath, 'content');

    await expect(readFolder(filePath)).rejects.toThrow('不是一个有效的目录');
  });
});

describe('formatFileTree', () => {
  it('应该能格式化空目录', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'test-format-'));
    
    try {
      const result = await readFolder(tempDir);
      const formatted = formatFileTree(result);
      
      expect(formatted).toContain('📁');
      expect(formatted).toContain('总文件数: 0');
      expect(formatted).toContain('总目录数: 0');
      expect(formatted).toContain('总大小: 0 B');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('应该能格式化带文件的目录', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'test-format-'));
    
    try {
      await writeFile(join(tempDir, 'test.txt'), 'content');
      
      const result = await readFolder(tempDir);
      const formatted = formatFileTree(result, true);
      
      expect(formatted).toContain('📄 test.txt');
      expect(formatted).toContain('总文件数: 1');
      expect(formatted).toContain('B)'); // 包含文件大小
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});