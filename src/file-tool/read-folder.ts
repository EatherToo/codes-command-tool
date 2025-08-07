import { readdir, stat } from 'fs/promises';
import { join, basename } from 'path';
import { type FileInfo, FileType, type ReadFolderOptions, type FileTree } from './types';

/**
 * 获取单个文件信息
 * @param filePath 文件路径
 * @returns 文件信息
 */
async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stats = await stat(filePath);
  const name = basename(filePath);
  
  return {
    name,
    path: filePath,
    type: stats.isDirectory() ? FileType.DIRECTORY : FileType.FILE,
    size: stats.size,
    lastModified: stats.mtime,
  };
}

/**
 * 递归读取目录结构
 * @param dirPath 目录路径
 * @param options 选项
 * @param currentDepth 当前深度
 * @returns 文件信息数组
 */
async function readDirectoryRecursive(
  dirPath: string,
  options: ReadFolderOptions = {},
  currentDepth: number = 0
): Promise<FileInfo[]> {
  const {
    recursive = true,
    maxDepth = Infinity,
    includeHidden = true,
    filter,
    sort
  } = options;

  // 检查深度限制
  if (currentDepth >= maxDepth) {
    return [];
  }

  try {
    const entries = await readdir(dirPath);
    const files: FileInfo[] = [];

    for (const entry of entries) {
      // 跳过隐藏文件（如果不包含）
      if (!includeHidden && entry.startsWith('.')) {
        continue;
      }

      const fullPath = join(dirPath, entry);
      const fileInfo = await getFileInfo(fullPath);

      // 应用过滤器
      if (filter && !filter(fileInfo)) {
        continue;
      }

      // 如果是目录且需要递归
      if (fileInfo.type === FileType.DIRECTORY && recursive) {
        fileInfo.children = await readDirectoryRecursive(
          fullPath,
          options,
          currentDepth + 1
        );
      }

      files.push(fileInfo);
    }

    // 排序
    if (sort) {
      files.sort(sort);
    } else {
      // 默认排序：目录在前，然后按名称排序
      files.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === FileType.DIRECTORY ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    }

    return files;
  } catch {
    // 如果无权限访问目录，返回空数组
    return [];
  }
}

/**
 * 计算文件树统计信息
 * @param files 文件信息数组
 * @returns 统计信息
 */
function calculateStats(files: FileInfo[]): {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
} {
  let totalFiles = 0;
  let totalDirectories = 0;
  let totalSize = 0;

  function traverse(fileList: FileInfo[]) {
    for (const file of fileList) {
      if (file.type === FileType.FILE) {
        totalFiles++;
        totalSize += file.size;
      } else {
        totalDirectories++;
        if (file.children) {
          traverse(file.children);
        }
      }
    }
  }

  traverse(files);
  return { totalFiles, totalDirectories, totalSize };
}

/**
 * 读取指定目录的文件结构
 * @param dirPath 目录路径
 * @param options 选项配置
 * @returns 文件结构树
 */
export async function readFolder(
  dirPath: string,
  options: ReadFolderOptions = {}
): Promise<FileTree> {
  // 验证目录路径
  const rootInfo = await getFileInfo(dirPath);
  if (rootInfo.type !== FileType.DIRECTORY) {
    throw new Error(`路径 "${dirPath}" 不是一个有效的目录`);
  }

  // 读取目录内容
  rootInfo.children = await readDirectoryRecursive(dirPath, options);

  // 计算统计信息
  const stats = calculateStats(rootInfo.children || []);

  return {
    root: rootInfo,
    ...stats
  };
}

/**
 * 将文件树转换为文本格式显示
 * @param fileTree 文件树
 * @param showSize 是否显示文件大小
 * @returns 格式化的文本
 */
export function formatFileTree(fileTree: FileTree, showSize: boolean = false): string {
  const lines: string[] = [];
  
  lines.push(`📁 ${fileTree.root.name}/`);
  lines.push(`├── 总文件数: ${fileTree.totalFiles}`);
  lines.push(`├── 总目录数: ${fileTree.totalDirectories}`);
  lines.push(`└── 总大小: ${formatBytes(fileTree.totalSize)}`);
  lines.push('');

  function formatNode(
    file: FileInfo,
    prefix: string = '',
    isLast: boolean = true
  ) {
    const connector = isLast ? '└── ' : '├── ';
    const icon = file.type === FileType.DIRECTORY ? '📁' : '📄';
    const sizeInfo = showSize && file.type === FileType.FILE 
      ? ` (${formatBytes(file.size)})` 
      : '';
    
    lines.push(`${prefix}${connector}${icon} ${file.name}${sizeInfo}`);

    if (file.children && file.children.length > 0) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      file.children.forEach((child, index) => {
        const isChildLast = index === (file.children?.length ?? 0) - 1;
        formatNode(child, childPrefix, isChildLast);
      });
    }
  }

  if (fileTree.root.children) {
    fileTree.root.children.forEach((file, index) => {
      const isLast = index === (fileTree.root.children?.length ?? 0) - 1;
      formatNode(file, '', isLast);
    });
  }

  return lines.join('\n');
}

/**
 * 格式化字节大小
 * @param bytes 字节数
 * @returns 格式化的大小字符串
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
