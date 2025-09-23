import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/data/models/User.js";

describe("Flujos de Usuarios", () => {
  let accessToken;
  let refreshToken;

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it(
    "debería registrar un nuevo usuario",
    async () => {
      const userData = {
        username: "testuser",
        password: "password123"
      };

      const response = await request(app)
        .post("/api/users/register")
        .send(userData)
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
    },
    10000
  );

  it(
    "debería iniciar sesión con un usuario registrado",
    async () => {
      const userData = {
        username: "testuser",
        password: "password123"
      };
      await request(app).post("/api/users/register").send(userData);

      const response = await request(app)
        .post("/api/users/login")
        .send(userData)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    },
    10000
  );

  it(
    "debería iniciar sesión con un usuario registrado",
    async () => {
      const userData = {
        username: "testuser",
        password: "password123"
      };
      await request(app).post("/api/users/register").send(userData);

      const response = await request(app)
        .post("/api/users/login")
        .send(userData)
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    },
    10000
  );

  it(
    "debería refrescar el token de acceso",
    async () => {
      const userData = {
        username: "testuser",
        password: "password123"
      };
      await request(app).post("/api/users/register").send(userData);
      const loginResponse = await request(app)
        .post("/api/users/login")
        .send(userData);

      const response = await request(app)
        .post("/api/users/refresh-token")
        .send({ refreshToken: loginResponse.body.refreshToken })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    },
    10000
  );
});
