#!/bin/bash
# setup-tests.sh

SERVICES=("auth" "users" "posts" "requests" "notification" "profile" "ratings" "messages" "conversations" "chat" "files")

for service in "${SERVICES[@]}"; do
  echo "Setting up tests for ${service}-service..."
  
  cd "services/${service}-service"
  
  # Crear estructura de carpetas
  mkdir -p tests/unit tests/integration tests/e2e
  
  # Crear archivos base si no existen
  if [ ! -f "jest.config.js" ]; then
    cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/unit/**/*.test.js',
    '**/integration/**/*.test.js',
    '**/e2e/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.ts',
    '!src/server.js',
    '!src/index.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000
};
EOF
  fi
  
  if [ ! -f "tests/setup.js" ]; then
    cat > tests/setup.js << 'EOF'
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
EOF
  fi
  
  # Crear test de ejemplo
  if [ ! -f "tests/unit/example.test.js" ]; then
    cat > tests/unit/example.test.js << 'EOF'
describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
EOF
  fi
  
  cd ../..
done

echo "Test setup complete for all services!"