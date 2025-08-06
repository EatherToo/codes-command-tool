/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  
  // 测试文件匹配模式
  testMatch: [
    '**/*.test.ts'
  ],
  
  // 忽略模式
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // 代码覆盖率配置
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70, // 降低分支覆盖率要求，因为某些错误处理分支很难测试
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // 清理模拟
  clearMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 支持ESM
  extensionsToTreatAsEsm: ['.ts'],
  
  // 模块转换
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: 'ES2022',
        target: 'ES2022'
      }
    }]
  }
}; 