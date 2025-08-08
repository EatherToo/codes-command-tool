import { mkdir, rm, stat, readFile } from 'fs/promises';
import { join } from 'path';
import { createFile, safeCreateFile } from './create-file';
import { FileType } from './types';

// 测试目录
const TEST_DIR = join(__dirname, '../../test-files-create');

describe('创建文件功能测试', () => {
  beforeAll(async () => {
    try {
      await rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    try {
      await rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  test('应该能在已存在目录创建文件', async () => {
    const dir = join(TEST_DIR, 'exists');
    await mkdir(dir, { recursive: true });

    const result = await createFile(dir, 'a.txt', 'hello');

    expect(result.name).toBe('a.txt');
    expect(result.type).toBe(FileType.FILE);
    expect(result.size).toBeGreaterThan(0);
    expect(typeof result.lastModified).toBe('object');

    const filePath = join(dir, 'a.txt');
    const content = await readFile(filePath, 'utf8');
    expect(content).toBe('hello');
  });

  test('目录不存在且 ensureDir=false 应抛错', async () => {
    const dir = join(TEST_DIR, 'not-exists-1');
    await expect(
      createFile(dir, 'b.txt', 'x', { ensureDir: false })
    ).rejects.toThrow('目录不存在');
  });

  test('目录不存在且 ensureDir=true 应自动创建并写入', async () => {
    const dir = join(TEST_DIR, 'auto', 'sub');
    const res = await createFile(dir, 'c.txt', 'data', { ensureDir: true });
    expect(res.path).toBe(join(dir, 'c.txt'));
    const s = await stat(join(dir, 'c.txt'));
    expect(s.isFile()).toBe(true);
  });

  test('默认不允许覆盖同名文件', async () => {
    const dir = join(TEST_DIR, 'no-overwrite');
    await mkdir(dir, { recursive: true });
    await createFile(dir, 'd.txt', 'v1');

    await expect(createFile(dir, 'd.txt', 'v2')).rejects.toThrow('已存在');

    const content = await readFile(join(dir, 'd.txt'), 'utf8');
    expect(content).toBe('v1');
  });

  test('允许覆盖时应成功覆盖内容', async () => {
    const dir = join(TEST_DIR, 'overwrite');
    await mkdir(dir, { recursive: true });
    await createFile(dir, 'e.txt', 'old');
    const res = await createFile(dir, 'e.txt', 'new', { overwrite: true });
    expect(res.size).toBeGreaterThan(0);
    const content = await readFile(join(dir, 'e.txt'), 'utf8');
    expect(content).toBe('new');
  });

  test('默认不允许嵌套路径作为文件名', async () => {
    const dir = join(TEST_DIR, 'nested-disallow');
    await mkdir(dir, { recursive: true });
    await expect(
      createFile(dir, 'sub/nested.txt', 'x')
    ).rejects.toThrow('不能包含路径分隔符');
  });

  test('允许嵌套路径时应创建子目录并写入', async () => {
    const dir = join(TEST_DIR, 'nested-allow');
    await mkdir(dir, { recursive: true });
    const res = await createFile(dir, 'sub/dir/file.txt', 'nested', {
      allowNestedPath: true,
      ensureDir: true
    });
    expect(res.path).toBe(join(dir, 'sub/dir/file.txt'));
    const data = await readFile(join(dir, 'sub/dir/file.txt'), 'utf8');
    expect(data).toBe('nested');
  });

  test('safeCreateFile 失败时返回 null', async () => {
    const dir = join(TEST_DIR, 'safe-null');
    const result = await safeCreateFile(dir, 'x.txt', '1', { ensureDir: false });
    expect(result).toBeNull();
  });
});


