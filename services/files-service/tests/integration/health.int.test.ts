import request from "supertest";
import { app } from "../../src/app";

describe("files-service integration test", () => {
  it("GET /health should return 200", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      service: "files"
    });
  });
});
