import { writeFile, mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { type CreateFileOptions, type FileInfo, FileType } from './types';

/**
 * 在指定目录下创建文件
 * @param directoryPath 目标目录路径
 * @param fileName 文件名（默认不允许包含路径分隔符）
 * @param content 文件内容，默认空字符串
 * @param options 创建选项
 * @returns 创建后的文件信息
 */
export async function createFile(
  directoryPath: string,
  fileName: string,
  content: string | Buffer = '',
  options: CreateFileOptions = {}
): Promise<FileInfo> {
  const {
    overwrite = false,
    ensureDir = true,
    encoding = 'utf8',
    mode,
    allowNestedPath = false
  } = options;

  if (!directoryPath || typeof directoryPath !== 'string') {
    throw new Error('目录路径无效');
  }
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('文件名无效');
  }

  // 保护：默认不允许路径穿越或包含分隔符
  if (!allowNestedPath) {
    if (fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
      throw new Error('文件名不能包含路径分隔符或上级目录引用');
    }
  }

  // 确保目录存在
  try {
    const dirStats = await stat(directoryPath);
    if (!dirStats.isDirectory()) {
      throw new Error(`路径 "${directoryPath}" 不是一个有效的目录`);
    }
  } catch {
    if (ensureDir) {
      await mkdir(directoryPath, { recursive: true });
    } else {
      throw new Error(`目录不存在: ${directoryPath}`);
    }
  }

  const fullPath = join(directoryPath, fileName);

  // 若允许嵌套路径，确保父目录存在
  if (allowNestedPath) {
    const lastSlashIndex = Math.max(fullPath.lastIndexOf('/'), fullPath.lastIndexOf('\\'));
    if (lastSlashIndex > -1) {
      const parentDir = fullPath.slice(0, lastSlashIndex);
      await mkdir(parentDir, { recursive: true });
    }
  }

  // 存在性与覆盖策略
  let fileExists = false;
  try {
    const existing = await stat(fullPath);
    fileExists = existing.isFile();
  } catch {
    fileExists = false;
  }

  if (fileExists && !overwrite) {
    throw new Error(`文件已存在，且未允许覆盖: ${fullPath}`);
  }

  try {
    const flag = overwrite ? 'w' : 'wx';
    if (typeof content === 'string') {
      await writeFile(fullPath, content, { encoding, mode, flag });
    } else {
      await writeFile(fullPath, content, { mode, flag });
    }

    const stats = await stat(fullPath);
    const fileInfo: FileInfo = {
      name: fullPath.split(/[/\\]/).pop() || '',
      path: fullPath,
      type: FileType.FILE,
      size: stats.size,
      lastModified: stats.mtime
    };

    return fileInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`创建文件失败: ${error.message}`);
    }
    throw new Error('创建文件失败: 未知错误');
  }
}

/**
 * 安全创建文件（失败返回 null）
 */
export async function safeCreateFile(
  directoryPath: string,
  fileName: string,
  content: string | Buffer = '',
  options: CreateFileOptions = {}
): Promise<FileInfo | null> {
  try {
    return await createFile(directoryPath, fileName, content, options);
  } catch {
    return null;
  }
}


