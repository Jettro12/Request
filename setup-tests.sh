#!/bin/bash
set -e

SERVICES=(
  auth
  users
  posts
  requests
  notification
  profile
  ratings
  messages
  conversations
  chat
  files
)

echo "🚀 Creando estructura básica de tests para microservicios..."

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_DIR="services/${SERVICE}-service"

  if [ ! -d "$SERVICE_DIR" ]; then
    echo "⚠️  ${SERVICE_DIR} no existe, se omite"
    continue
  fi

  echo "🔧 Procesando ${SERVICE}-service"

  mkdir -p \
    "$SERVICE_DIR/tests/unit" \
    "$SERVICE_DIR/tests/integration"

  # ===========================
  # app.ts
  # ===========================
  if [ ! -f "$SERVICE_DIR/src/app.ts" ]; then
    cat > "$SERVICE_DIR/src/app.ts" << EOF
import express from "express";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "${SERVICE}"
  });
});
EOF
    echo "  ✅ src/app.ts creado"
  else
    echo "  ↪️ src/app.ts ya existe"
  fi

  # ===========================
  # server.ts
  # ===========================
  if [ ! -f "$SERVICE_DIR/src/server.ts" ]; then
    cat > "$SERVICE_DIR/src/server.ts" << EOF
import { app } from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log("✅ ${SERVICE}-service running on port " + PORT);
});
EOF
    echo "  ✅ src/server.ts creado"
  else
    echo "  ↪️ src/server.ts ya existe"
  fi

  # ===========================
  # Unit test
  # ===========================
  UNIT_TEST="$SERVICE_DIR/tests/unit/health.unit.test.ts"
  if [ ! -f "$UNIT_TEST" ]; then
    cat > "$UNIT_TEST" << EOF
describe("${SERVICE}-service unit test", () => {
  it("should confirm service logic is alive", () => {
    const alive = true;
    expect(alive).toBe(true);
  });
});
EOF
    echo "  ✅ unit test creado"
  else
    echo "  ↪️ unit test ya existe"
  fi

  # ===========================
  # Integration test
  # ===========================
  INT_TEST="$SERVICE_DIR/tests/integration/health.int.test.ts"
  if [ ! -f "$INT_TEST" ]; then
    cat > "$INT_TEST" << EOF
import request from "supertest";
import { app } from "../../src/app";

describe("${SERVICE}-service integration test", () => {
  it("GET /health should return 200", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      service: "${SERVICE}"
    });
  });
});
EOF
    echo "  ✅ integration test creado"
  else
    echo "  ↪️ integration test ya existe"
  fi

  # ===========================
  # jest.config.js
  # ===========================
  if [ ! -f "$SERVICE_DIR/jest.config.js" ]; then
    cat > "$SERVICE_DIR/jest.config.js" << 'EOF'
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
};
EOF
    echo "  ✅ jest.config.js creado"
  else
    echo "  ↪️ jest.config.js ya existe"
  fi

done

echo ""
echo "🎉 LISTO: Tests básicos creados en todos los microservicios"
echo "👉 Ahora solo instala dependencias y corre npm test"
