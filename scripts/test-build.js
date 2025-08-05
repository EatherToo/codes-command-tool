#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const distDir = 'dist';
const requiredFiles = ['index.js', 'index.cjs', 'index.d.ts'];

console.log('🔍 检查构建文件...');

let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = join(distDir, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file} 存在`);
    
    // 检查文件大小
    const stats = readFileSync(filePath, 'utf8');
    console.log(`   文件大小: ${stats.length} 字符`);
  } else {
    console.log(`❌ ${file} 不存在`);
    allFilesExist = false;
  }
}

if (allFilesExist) {
  console.log('\n🎉 所有构建文件都已生成！');
} else {
  console.log('\n❌ 构建文件缺失，请运行 pnpm run build');
  process.exit(1);
} 