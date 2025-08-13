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
  /** 是否包含隐藏文件，默认 true */
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

/**
 * 文件内容读取选项
 */
export interface ReadFileContentOptions {
  /** 文件编码，默认 'utf8' */
  encoding?: BufferEncoding;
  /** 是否检测文件类型，默认 true */
  detectType?: boolean;
  /** 最大文件大小限制（字节），默认 10MB */
  maxSize?: number;
}

/**
 * 文件内容信息
 */
export interface FileContentInfo {
  /** 文件路径 */
  path: string;
  /** 文件名 */
  name: string;
  /** 文件扩展名 */
  extension: string;
  /** 文件大小（字节） */
  size: number;
  /** 最后修改时间 */
  lastModified: Date;
  /** 文件内容 */
  content: string | Buffer;
  /** 文件编码 */
  encoding: BufferEncoding | 'binary';
  /** 是否为文本文件 */
  isText: boolean;
  /** 行数（仅文本文件） */
  lineCount?: number;
}

/**
 * 创建文件选项
 */
export interface CreateFileOptions {
  /** 是否允许覆盖已存在文件，默认 false */
  overwrite?: boolean;
  /** 目录不存在时是否自动创建，默认 true */
  ensureDir?: boolean;
  /** 文本内容编码，默认 'utf8'（当 content 为字符串时生效） */
  encoding?: BufferEncoding;
  /** 文件权限模式，例如 0o644，可选 */
  mode?: number;
  /** 是否允许在 fileName 中包含子路径，默认 false */
  allowNestedPath?: boolean;
}

/**
 * 删除文件选项
 */
export interface DeleteFileOptions {
  /** 是否允许在 fileName 中包含子路径，默认 false */
  allowNestedPath?: boolean;
}

/**
 * 删除目录选项
 */
export interface DeleteFolderOptions {
  /** 是否递归删除，默认 true */
  recursive?: boolean;
  /** 强制删除（忽略不存在等错误），默认 false */
  force?: boolean;
  /** 是否允许在 folderName 中包含子路径，默认 false */
  allowNestedPath?: boolean;
}

/**
 * 补丁应用器构造选项
 */
export interface PatchApplierOptions {
  /** 工作目录 */
  workdir: string;
  /** 补丁文件内容 */
  patchContent: string;
  /** 文件编码，默认 'utf8' */
  encoding?: BufferEncoding;
  /** 仅试运行，不写入磁盘，默认 false */
  dryRun?: boolean;
}

/**
 * 补丁应用结果
 */
export interface PatchResult {
  /** 文件路径 */
  path: string;
  /** 应用后的内容 */
  content: string;
  /** 是否成功 */
  success: boolean;
  /** 错误信息（如果失败） */
  error?: string;
}