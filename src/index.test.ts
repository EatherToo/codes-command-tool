import { MyLibrary, VERSION } from './index';

describe('MyLibrary', () => {
  let library: MyLibrary;

  beforeEach(() => {
    library = new MyLibrary();
  });

  describe('constructor', () => {
    it('should create instance with default name', () => {
      expect(library.getName()).toBe('Library');
    });

    it('should create instance with custom name', () => {
      const customLibrary = new MyLibrary('CustomLib');
      expect(customLibrary.getName()).toBe('CustomLib');
    });
  });

  describe('greet', () => {
    it('should greet with default library name', () => {
      const result = library.greet('World');
      expect(result).toBe('Hello, World! from Library');
    });

    it('should greet with custom library name', () => {
      const customLibrary = new MyLibrary('MyApp');
      const result = customLibrary.greet('User');
      expect(result).toBe('Hello, User! from MyApp');
    });

    it('should handle empty string target', () => {
      const result = library.greet('');
      expect(result).toBe('Hello, ! from Library');
    });

    it('should handle special characters in target', () => {
      const result = library.greet('测试用户');
      expect(result).toBe('Hello, 测试用户! from Library');
    });
  });

  describe('getName', () => {
    it('should return the library name', () => {
      expect(library.getName()).toBe('Library');
    });

    it('should return custom name when provided', () => {
      const customLibrary = new MyLibrary('TestLib');
      expect(customLibrary.getName()).toBe('TestLib');
    });
  });
});

describe('VERSION', () => {
  it('should be defined', () => {
    expect(VERSION).toBeDefined();
  });

  it('should be a string', () => {
    expect(typeof VERSION).toBe('string');
  });

  it('should match semantic versioning pattern', () => {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    expect(VERSION).toMatch(semverRegex);
  });

  it('should have correct version value', () => {
    expect(VERSION).toBe('1.0.0');
  });
}); 