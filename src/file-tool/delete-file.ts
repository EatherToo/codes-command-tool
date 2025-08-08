import { unlink, stat } from 'fs/promises';
import { join } from 'path';
import { type DeleteFileOptions, type FileInfo, FileType } from './types';

/**
 * 在指定目录下删除文件
 * @param directoryPath 目标目录路径
 * @param fileName 文件名（默认不允许包含路径分隔符）
 * @param options 删除选项
 * @returns 被删除文件的基本信息
 */
export async function deleteFile(
  directoryPath: string,
  fileName: string,
  options: DeleteFileOptions = {}
): Promise<FileInfo> {
  const { allowNestedPath = false } = options;

  if (!directoryPath || typeof directoryPath !== 'string') {
    throw new Error('目录路径无效');
  }
  if (!fileName || typeof fileName !== 'string') {
    throw new Error('文件名无效');
  }

  if (!allowNestedPath) {
    if (fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
      throw new Error('文件名不能包含路径分隔符或上级目录引用');
    }
  }

  const fullPath = join(directoryPath, fileName);

  // 在删除前读取文件信息（并验证确实是文件）
  let fileStats: Awaited<ReturnType<typeof stat>>;
  try {
    fileStats = await stat(fullPath);
  } catch {
    throw new Error(`文件不存在: ${fullPath}`);
  }

  if (!fileStats.isFile()) {
    throw new Error(`路径不是文件: ${fullPath}`);
  }

  const fileInfoBeforeDelete: FileInfo = {
    name: fullPath.split(/[/\\]/).pop() || '',
    path: fullPath,
    type: FileType.FILE,
    size: fileStats.size,
    lastModified: fileStats.mtime
  };

  try {
    await unlink(fullPath);
    return fileInfoBeforeDelete;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`删除文件失败: ${error.message}`);
    }
    throw new Error('删除文件失败: 未知错误');
  }
}

/**
 * 安全删除文件（失败返回 null）
 */
export async function safeDeleteFile(
  directoryPath: string,
  fileName: string,
  options: DeleteFileOptions = {}
): Promise<FileInfo | null> {
  try {
    return await deleteFile(directoryPath, fileName, options);
  } catch {
    return null;
  }
}


