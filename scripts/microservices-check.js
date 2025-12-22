#!/usr/bin/env node

/**
 * Migration utilities for microservices transition
 * Este script ayuda a validar y transicionar desde monolito a microservicios
 */

const http = require("http");

const SERVICES = {
  notification: "http://localhost:4001",
  posts: "http://localhost:4002",
  requests: "http://localhost:4003",
  monolith: "http://localhost:3000",
};

async function checkHealth(serviceName, url) {
  try {
    const response = await fetch(`${url}/health`, { timeout: 5000 });
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${serviceName}: ${url} - ${JSON.stringify(data)}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ ${serviceName}: ${url} - ${error.message}`);
    return false;
  }
}

async function healthCheck() {
  console.log("\n🏥 Checking service health...\n");
  for (const [name, url] of Object.entries(SERVICES)) {
    await checkHealth(name, url);
  }
}

async function testNotifications() {
  console.log("\n📨 Testing notification-service...\n");
  try {
    const response = await fetch(`${SERVICES.notification}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "TEST",
        title: "Test Notification",
        message: "This is a test from CLI",
        senderId: "system",
        targetUsers: ["test-user-123"],
      }),
    });
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

const command = process.argv[2];

switch (command) {
  case "health":
    healthCheck();
    break;
  case "test-notifications":
    testNotifications();
    break;
  default:
    console.log(`
Usage: npm run migrate -- [command]

Commands:
  health                  - Check health of all services
  test-notifications     - Test notification service endpoint
    `);
}
