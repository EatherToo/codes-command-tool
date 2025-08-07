/**
 * 文件类型枚举
 */
export enum FileType {
  /** 文件 */
  FILE = 'file',
  /** 目录 */
  DIRECTORY = 'directory'
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  /** 文件名 */
  name: string;
  /** 文件路径 */
  path: string;
  /** 文件类型 */
  type: FileType;
  /** 文件大小（字节） */
  size: number;
  /** 最后修改时间 */
  lastModified: Date;
  /** 子文件（如果是目录） */
  children?: FileInfo[];
}

/**
 * 读取目录选项
 */
export interface ReadFolderOptions {
  /** 是否递归读取子目录，默认 true */
  recursive?: boolean;
  /** 最大递归深度，默认 无限制 */
  maxDepth?: number;
  /** 是否包含隐藏文件，默认 false */
  includeHidden?: boolean;
  /** 文件过滤器，返回 true 则包含该文件 */
  filter?: (file: FileInfo) => boolean;
  /** 排序函数 */
  sort?: (a: FileInfo, b: FileInfo) => number;
}

/**
 * 文件结构树
 */
export interface FileTree {
  /** 根目录信息 */
  root: FileInfo;
  /** 文件总数 */
  totalFiles: number;
  /** 目录总数 */
  totalDirectories: number;
  /** 总大小（字节） */
  totalSize: number;
}