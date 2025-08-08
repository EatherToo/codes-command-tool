import { mkdir, writeFile, rm, stat } from 'fs/promises';
import { join } from 'path';
import { deleteFolder, safeDeleteFolder } from './delete-folder';

const TEST_DIR = join(__dirname, '../../test-files-delete-folder');

describe('删除目录功能测试', () => {
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

  test('应该能删除空目录', async () => {
    const dir = join(TEST_DIR, 'empty');
    await mkdir(dir, { recursive: true });

    const info = await deleteFolder(TEST_DIR, 'empty');
    expect(info.name).toBe('empty');
    await expect(stat(dir)).rejects.toThrow();
  });

  test('应该能递归删除非空目录', async () => {
    const dir = join(TEST_DIR, 'non-empty');
    await mkdir(join(dir, 'a/b'), { recursive: true });
    await writeFile(join(dir, 'file1.txt'), '1');
    await writeFile(join(dir, 'a', 'file2.txt'), '2');
    await writeFile(join(dir, 'a/b', 'file3.txt'), '3');

    const info = await deleteFolder(TEST_DIR, 'non-empty', { recursive: true });
    expect(info.path).toBe(dir);
    await expect(stat(dir)).rejects.toThrow();
  });

  test('默认不允许嵌套路径作为名称', async () => {
    await expect(deleteFolder(TEST_DIR, 'x/y')).rejects.toThrow('不能包含路径分隔符');
  });

  test('允许嵌套路径时可删除子路径目录', async () => {
    const dir = join(TEST_DIR, 'nested/target');
    await mkdir(dir, { recursive: true });
    const info = await deleteFolder(TEST_DIR, 'nested/target', { allowNestedPath: true });
    expect(info.name).toBe('target');
    await expect(stat(dir)).rejects.toThrow();
  });

  test('目录不存在应抛错（force=false）', async () => {
    await expect(deleteFolder(TEST_DIR, 'not-exists')).rejects.toThrow('目录不存在');
  });

  test('safeDeleteFolder 失败返回 null', async () => {
    const res = await safeDeleteFolder(TEST_DIR, 'still-not-exists');
    expect(res).toBeNull();
  });
});


