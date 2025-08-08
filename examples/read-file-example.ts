import { readFileContent, readTextFile, safeReadFileContent } from '../src/file-tool';
import { join } from 'path';

/**
 * 读取文件内容的使用示例
 */
async function examples() {
  console.log('=== 读取文件内容示例 ===\n');

  try {
    // 1. 基本使用 - 读取文本文件
    console.log('1. 读取文本文件:');
    const textFile = await readFileContent('./package.json');
    console.log(`文件名: ${textFile.name}`);
    console.log(`文件大小: ${textFile.size} 字节`);
    console.log(`是否为文本: ${textFile.isText}`);
    console.log(`行数: ${textFile.lineCount}`);
    console.log(`内容预览: ${(textFile.content as string).substring(0, 100)}...\n`);

    // 2. 指定编码读取
    console.log('2. 指定编码读取文件:');
    const fileWithEncoding = await readFileContent('./README.md', {
      encoding: 'utf8',
      maxSize: 1024 * 1024 // 1MB 限制
    });
    console.log(`文件编码: ${fileWithEncoding.encoding}`);
    console.log(`文件扩展名: ${fileWithEncoding.extension}\n`);

    // 3. 简化的文本文件读取
    console.log('3. 简化的文本文件读取:');
    const textContent = await readTextFile('./package.json');
    const packageJson = JSON.parse(textContent);
    console.log(`项目名称: ${packageJson.name}`);
    console.log(`项目版本: ${packageJson.version}\n`);

    // 4. 安全读取（不会抛出异常）
    console.log('4. 安全读取不存在的文件:');
    const safeResult = await safeReadFileContent('./not-exists.txt');
    console.log(`读取结果: ${safeResult ? '成功' : '失败'}\n`);

    // 5. 检测二进制文件
    console.log('5. 尝试读取可能的二进制文件:');
    const binaryCheck = await safeReadFileContent('./node_modules/.bin/jest');
    if (binaryCheck) {
      console.log(`文件类型: ${binaryCheck.isText ? '文本' : '二进制'}`);
      console.log(`编码: ${binaryCheck.encoding}`);
    } else {
      console.log('文件不存在或无法读取');
    }

  } catch (error) {
    console.error('读取文件时发生错误:', error);
  }
}

// 运行示例
if (require.main === module) {
  examples();
}
