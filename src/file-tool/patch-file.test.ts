import { mkdir, writeFile, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { PatchApplier } from './patch-file';

const TEST_DIR = join(__dirname, '../../test-files-patch');

describe('PatchApplier 类测试', () => {
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

  test('应该能解析多文件补丁', async () => {
    const file1 = 'file1.txt';
    const file2 = 'file2.txt';
    await writeFile(join(TEST_DIR, file1), 'line1\nline2\n');
    await writeFile(join(TEST_DIR, file2), 'content1\ncontent2\n');

    const multiPatch = `--- a/${file1}
+++ b/${file1}
@@ -1,2 +1,2 @@
 line1
-line2
+line2-modified
--- a/${file2}
+++ b/${file2}
@@ -1,2 +1,2 @@
 content1
-content2
+content2-modified`;

    const applier = new PatchApplier({
      workdir: TEST_DIR,
      patchContent: multiPatch
    });

    expect(applier.getFileCount()).toBe(2);
    const patches = applier.getParsedPatches();
    expect(patches).toHaveLength(2);
    expect(patches[0].oldFileName).toContain(file1);
    expect(patches[1].oldFileName).toContain(file2);
  });

  test('应该能应用多文件补丁', async () => {
    const file1 = 'multi1.txt';
    const file2 = 'multi2.txt';
    await writeFile(join(TEST_DIR, file1), 'A\nB\n');
    await writeFile(join(TEST_DIR, file2), 'X\nY\n');

    const multiPatch = `--- a/${file1}
+++ b/${file1}
@@ -1,2 +1,2 @@
 A
-B
+B-new
--- a/${file2}
+++ b/${file2}
@@ -1,2 +1,2 @@
 X
-Y
+Y-new`;

    const applier = new PatchApplier({
      workdir: TEST_DIR,
      patchContent: multiPatch
    });

    const results = await applier.applyAll();
    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(true);

    const content1 = await readFile(join(TEST_DIR, file1), 'utf8');
    const content2 = await readFile(join(TEST_DIR, file2), 'utf8');
    expect(content1).toBe('A\nB-new\n');
    expect(content2).toBe('X\nY-new\n');
  });

  test('dryRun 模式应返回内容但不写入磁盘', async () => {
    const fileName = 'dry-test.txt';
    await writeFile(join(TEST_DIR, fileName), 'original\n');

    const patch = `--- a/${fileName}
+++ b/${fileName}
@@ -1,1 +1,1 @@
-original
+modified`;

    const applier = new PatchApplier({
      workdir: TEST_DIR,
      patchContent: patch,
      dryRun: true
    });

    const results = await applier.applyAll();
    expect(results[0].success).toBe(true);
    expect(results[0].content).toBe('modified\n');

    // 验证文件未被修改
    const diskContent = await readFile(join(TEST_DIR, fileName), 'utf8');
    expect(diskContent).toBe('original\n');
  });

  test('文件不存在时应返回错误', async () => {
    const patch = `--- a/nonexistent.txt
+++ b/nonexistent.txt
@@ -1,1 +1,1 @@
-content
+new-content`;

    const applier = new PatchApplier({
      workdir: TEST_DIR,
      patchContent: patch
    });

    const results = await applier.applyAll();
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('应用补丁失败');
  });
});