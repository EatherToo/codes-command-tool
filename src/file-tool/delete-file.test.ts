import { mkdir, writeFile, rm, stat } from 'fs/promises';
import { join } from 'path';
import { deleteFile, safeDeleteFile } from './delete-file';

const TEST_DIR = join(__dirname, '../../test-files-delete');

describe('删除文件功能测试', () => {
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

  test('应该能删除已存在的文件', async () => {
    const dir = join(TEST_DIR, 'exists');
    await mkdir(dir, { recursive: true });
    const filePath = join(dir, 'a.txt');
    await writeFile(filePath, 'hello');

    const info = await deleteFile(dir, 'a.txt');
    expect(info.name).toBe('a.txt');
    await expect(stat(filePath)).rejects.toThrow();
  });

  test('默认不允许嵌套路径作为文件名', async () => {
    const dir = join(TEST_DIR, 'nested-disallow');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'sub', 'b.txt'), 'x').catch(async () => {
      await mkdir(join(dir, 'sub'), { recursive: true });
      await writeFile(join(dir, 'sub', 'b.txt'), 'x');
    });

    await expect(deleteFile(dir, 'sub/b.txt')).rejects.toThrow('不能包含路径分隔符');
  });

  test('允许嵌套路径时应能删除子目录下文件', async () => {
    const dir = join(TEST_DIR, 'nested-allow');
    await mkdir(join(dir, 'sub/dir'), { recursive: true });
    const filePath = join(dir, 'sub/dir', 'c.txt');
    await writeFile(filePath, 'nested');

    const info = await deleteFile(dir, 'sub/dir/c.txt', { allowNestedPath: true });
    expect(info.path).toBe(filePath);
    await expect(stat(filePath)).rejects.toThrow();
  });

  test('删除不存在的文件应抛错', async () => {
    const dir = join(TEST_DIR, 'not-exists');
    await mkdir(dir, { recursive: true });
    await expect(deleteFile(dir, 'x.txt')).rejects.toThrow('文件不存在');
  });

  test('safeDeleteFile 失败返回 null', async () => {
    const dir = join(TEST_DIR, 'safe-null');
    await mkdir(dir, { recursive: true });
    const result = await safeDeleteFile(dir, 'not-here.txt');
    expect(result).toBeNull();
  });
});


