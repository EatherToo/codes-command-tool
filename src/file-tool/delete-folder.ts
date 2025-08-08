import { rm, stat } from 'fs/promises';
import { join } from 'path';
import { type DeleteFolderOptions, type FileInfo, FileType } from './types';

/**
 * 在指定目录下删除文件夹
 * @param directoryPath 目标目录路径
 * @param folderName 要删除的文件夹名称（默认不允许包含路径分隔符）
 * @param options 删除选项
 * @returns 被删除目录的基本信息
 */
export async function deleteFolder(
  directoryPath: string,
  folderName: string,
  options: DeleteFolderOptions = {}
): Promise<FileInfo> {
  const {
    recursive = true,
    force = false,
    allowNestedPath = false
  } = options;

  if (!directoryPath || typeof directoryPath !== 'string') {
    throw new Error('目录路径无效');
  }
  if (!folderName || typeof folderName !== 'string') {
    throw new Error('文件夹名称无效');
  }

  if (!allowNestedPath) {
    if (folderName.includes('/') || folderName.includes('\\') || folderName.includes('..')) {
      throw new Error('文件名不能包含路径分隔符或上级目录引用');
    }
  }

  const fullPath = join(directoryPath, folderName);

  // 删除前获取信息并校验类型
  let dirStats: Awaited<ReturnType<typeof stat>>;
  try {
    dirStats = await stat(fullPath);
  } catch {
    throw new Error(`目录不存在: ${fullPath}`);
  }

  if (!dirStats.isDirectory()) {
    throw new Error(`路径不是目录: ${fullPath}`);
  }

  const infoBeforeDelete: FileInfo = {
    name: fullPath.split(/[/\\]/).pop() || '',
    path: fullPath,
    type: FileType.DIRECTORY,
    size: dirStats.size,
    lastModified: dirStats.mtime
  };

  try {
    await rm(fullPath, { recursive, force });
    return infoBeforeDelete;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`删除目录失败: ${error.message}`);
    }
    throw new Error('删除目录失败: 未知错误');
  }
}

/**
 * 安全删除文件夹（失败返回 null）
 */
export async function safeDeleteFolder(
  directoryPath: string,
  folderName: string,
  options: DeleteFolderOptions = {}
): Promise<FileInfo | null> {
  try {
    return await deleteFolder(directoryPath, folderName, options);
  } catch {
    return null;
  }
}


