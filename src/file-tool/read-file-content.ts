import { readFile, stat } from 'fs/promises';
import { extname } from 'path';
import { type ReadFileContentOptions, type FileContentInfo } from './types';

/**
 * 常见文本文件扩展名
 */
const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.json', '.xml', '.html', '.htm',
  '.css', '.scss', '.sass', '.less', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
  '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sh', '.bat',
  '.sql', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.log', '.csv',
  '.svg', '.vue', '.svelte', '.astro', '.r', '.m', '.pl', '.lua', '.dart',
  '.gradle', '.dockerfile', '.gitignore', '.gitattributes', '.editorconfig'
]);

/**
 * 检测文件是否为文本文件
 * @param filePath 文件路径
 * @param buffer 文件内容缓冲区（可选）
 * @returns 是否为文本文件
 */
function isTextFile(filePath: string, buffer?: Buffer): boolean {
  // 首先通过扩展名判断
  const ext = extname(filePath).toLowerCase();
  if (TEXT_EXTENSIONS.has(ext)) {
    return true;
  }

  // 如果没有扩展名或扩展名不在已知列表中，通过内容判断
  if (buffer) {
    // 检查是否包含二进制字符
    for (let i = 0; i < Math.min(buffer.length, 8000); i++) {
      const byte = buffer[i];
      // 检查 null 字节和其他控制字符（除了常见的换行符、制表符等）
      if (byte !== undefined && (byte === 0 || (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13))) {
        return false;
      }
    }
    return true;
  }

  // 默认情况下，没有扩展名的文件可能是文本文件
  return ext === '';
}

/**
 * 格式化文件大小
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

/**
 * 读取指定文件的内容
 * @param filePath 文件路径
 * @param options 读取选项
 * @returns 文件内容信息
 */
export async function readFileContent(
  filePath: string,
  options: ReadFileContentOptions = {}
): Promise<FileContentInfo> {
  const {
    encoding = 'utf8',
    detectType = true,
    maxSize = 10 * 1024 * 1024 // 10MB
  } = options;

  try {
    // 获取文件信息
    const stats = await stat(filePath);
    
    // 检查是否为文件
    if (!stats.isFile()) {
      throw new Error(`路径 "${filePath}" 不是一个有效的文件`);
    }

    // 检查文件大小限制
    if (stats.size > maxSize) {
      throw new Error(
        `文件大小 ${formatBytes(stats.size)} 超过限制 ${formatBytes(maxSize)}`
      );
    }

    // 读取文件内容
    const buffer = await readFile(filePath);
    
    // 检测文件类型
    const isText = detectType ? isTextFile(filePath, buffer) : true;
    const finalEncoding = isText ? encoding : 'binary';
    
    // 转换内容
    const content = isText ? buffer.toString(encoding) : buffer;
    
    // 计算行数（仅文本文件）
    let lineCount: number | undefined;
    if (isText && typeof content === 'string') {
      lineCount = content.split('\n').length;
    }

    // 提取文件信息
    const pathParts = filePath.split(/[/\\]/);
    const fileName = pathParts[pathParts.length - 1] || '';
    const extension = extname(fileName);

    const result: FileContentInfo = {
      path: filePath,
      name: fileName,
      extension,
      size: stats.size,
      lastModified: stats.mtime,
      content,
      encoding: finalEncoding,
      isText
    };

    if (lineCount !== undefined) {
      result.lineCount = lineCount;
    }

    return result;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`读取文件失败: ${error.message}`);
    }
    throw new Error(`读取文件失败: 未知错误`);
  }
}

/**
 * 读取文本文件内容（简化版本，只读取文本文件）
 * @param filePath 文件路径
 * @param encoding 文件编码，默认 'utf8'
 * @returns 文件内容字符串
 */
export async function readTextFile(
  filePath: string, 
  encoding: BufferEncoding = 'utf8'
): Promise<string> {
  const fileInfo = await readFileContent(filePath, { encoding, detectType: true });
  
  if (!fileInfo.isText) {
    throw new Error(`文件 "${filePath}" 不是文本文件`);
  }
  
  return fileInfo.content as string;
}

/**
 * 安全读取文件内容（带错误处理）
 * @param filePath 文件路径
 * @param options 读取选项
 * @returns 文件内容信息或 null（如果读取失败）
 */
export async function safeReadFileContent(
  filePath: string,
  options: ReadFileContentOptions = {}
): Promise<FileContentInfo | null> {
  try {
    return await readFileContent(filePath, options);
  } catch {
    return null;
  }
}
