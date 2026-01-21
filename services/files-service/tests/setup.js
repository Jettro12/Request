process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-123';
process.env.PORT = '0';

// Mock comunes
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn()
  },
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }),
  transports: {
    Console: jest.fn()
  }
}));

afterEach(() => {
  jest.clearAllMocks();
});
