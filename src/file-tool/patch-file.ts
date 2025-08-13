import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { parsePatch, applyPatch, type StructuredPatch } from 'diff';
import { type PatchApplierOptions, type PatchResult } from './types';

/**
 * 补丁应用器类
 * 使用jsdiff库支持解析多文件补丁并应用到对应文件
 */
export class PatchApplier {
  private readonly workdir: string;
  private readonly patchContent: string;
  private readonly encoding: BufferEncoding;
  private readonly dryRun: boolean;
  private parsedPatches: StructuredPatch[] = [];

  constructor(options: PatchApplierOptions) {
    const {
      workdir,
      patchContent,
      encoding = 'utf8',
      dryRun = false
    } = options;

    if (!workdir || typeof workdir !== 'string') {
      throw new Error('工作目录路径无效');
    }
    if (!patchContent || typeof patchContent !== 'string') {
      throw new Error('补丁内容无效');
    }

    this.workdir = resolve(workdir);
    this.patchContent = patchContent;
    this.encoding = encoding;
    this.dryRun = dryRun;

    // 使用jsdiff解析补丁内容
    this.parsedPatches = parsePatch(this.patchContent);
  }

  /**
   * 清理路径，移除前缀 a/ 或 b/
   */
  private cleanPath(path?: string): string | undefined {
    if (!path) return path;
    return path.replace(/^[ab]\//, '').trim();
  }

  /**
   * 确定文件的实际路径
   */
  private resolveFilePath(patch: StructuredPatch): string {
    const cleanedFromPath = this.cleanPath(patch.oldFileName);
    const cleanedToPath = this.cleanPath(patch.newFileName);
    
    // 优先使用 newFileName，因为它表示修改后的文件
    const targetPath = cleanedToPath || cleanedFromPath;
    
    if (!targetPath) {
      throw new Error('无法确定补丁的目标文件路径');
    }

    return join(this.workdir, targetPath);
  }

  /**
   * 应用单个文件的补丁
   */
  private async applySingleFilePatch(patch: StructuredPatch): Promise<PatchResult> {
    try {
      const filePath = this.resolveFilePath(patch);

      // 读取原文件
      const original = await readFile(filePath, { encoding: this.encoding });
      
      // 使用jsdiff应用补丁
      const nextContent = applyPatch(original, patch);
      
      if (nextContent === false) {
        return {
          path: filePath,
          content: '',
          success: false,
          error: '应用补丁失败：补丁与原文件不匹配'
        };
      }

      // 写入文件（如果不是干运行）
      if (!this.dryRun) {
        await writeFile(filePath, nextContent, { encoding: this.encoding });
      }

      return {
        path: filePath,
        content: nextContent,
        success: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      let errorPath: string;
      try {
        errorPath = this.resolveFilePath(patch);
      } catch {
        errorPath = 'unknown';
      }
      return {
        path: errorPath,
        content: '',
        success: false,
        error: `应用补丁失败: ${errorMessage}`
      };
    }
  }

  /**
   * 应用所有补丁
   */
  public async applyAll(): Promise<PatchResult[]> {
    const results: PatchResult[] = [];
    
    for (const patch of this.parsedPatches) {
      const result = await this.applySingleFilePatch(patch);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 获取解析后的补丁信息
   */
  public getParsedPatches(): StructuredPatch[] {
    return [...this.parsedPatches];
  }

  /**
   * 获取补丁涉及的文件数量
   */
  public getFileCount(): number {
    return this.parsedPatches.length;
  }
}
