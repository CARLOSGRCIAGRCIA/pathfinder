import request from "supertest";
import app from "../../../src/app.js";
import User from "../../../src/data/models/User.js";
import Map from "../../../src/data/models/Map.js";

describe("Flujos de Mapas", () => {
  let accessToken;
  let userId;
  let testUser = {
    username: "mapuser",
    password: "password123"
  };

  beforeAll(async () => {
    await User.deleteMany({});
    await Map.deleteMany({});

    const registerResponse = await request(app)
      .post("/api/users/register")
      .send(testUser);

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(testUser);

    accessToken = loginResponse.body.accessToken;
    userId = loginResponse.body.user._id;
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({});
    await Map.deleteMany({});
  }, 10000);

  it("debería crear un nuevo mapa", async () => {
    const mapData = {
      name: "Test Map",
      description: "Mapa de prueba para tests",
      width: 1000,
      height: 800,
      scale: 10,
      unit: "metros"
    };

    const response = await request(app)
      .post("/api/maps")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mapData)
      .expect(201);

    expect(response.body.map).toBeDefined();
    expect(response.body.map.name).toBe(mapData.name);
    expect(response.body.map.description).toBe(mapData.description);
    expect(response.body.map.width).toBe(mapData.width);
    expect(response.body.map.height).toBe(mapData.height);
    expect(response.body.map.scale).toBe(mapData.scale);
    expect(response.body.map.unit).toBe(mapData.unit);
    expect(response.body.map.creator).toBe(userId);
  }, 20000); 

  it("debería obtener todos los mapas del usuario", async () => {
    await Map.deleteMany({});
    
    const mapData1 = {
      name: "Test Map 1",
      description: "Mapa de prueba 1",
      width: 1000,
      height: 800,
      scale: 10,
      unit: "metros"
    };

    const mapData2 = {
      name: "Test Map 2",
      description: "Mapa de prueba 2",
      width: 1500,
      height: 1200,
      scale: 15,
      unit: "metros"
    };

    await request(app)
      .post("/api/maps")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mapData1);

    await request(app)
      .post("/api/maps")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mapData2);

    const response = await request(app)
      .get("/api/maps")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.maps).toBeDefined();
    expect(response.body.maps.length).toBe(2);
    const mapNames = response.body.maps.map(m => m.name);
    expect(mapNames).toContain(mapData1.name);
    expect(mapNames).toContain(mapData2.name);
  }, 30000);

  it("debería obtener un mapa específico por ID", async () => {
    await Map.deleteMany({});
    
    const mapData = {
      name: "Test Map ID",
      description: "Mapa de prueba para obtener por ID",
      width: 1000,
      height: 800,
      scale: 10,
      unit: "metros"
    };

    const createResponse = await request(app)
      .post("/api/maps")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mapData);

    const mapId = createResponse.body.map._id;

    const response = await request(app)
      .get(`/api/maps/${mapId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.map).toBeDefined();
    expect(response.body.map._id).toBe(mapId);
    expect(response.body.map.name).toBe(mapData.name);
    expect(response.body.map.description).toBe(mapData.description);
  }, 20000);

  it("debería actualizar un mapa existente", async () => {
    const mapData = {
      name: "Test Map Update",
      description: "Mapa de prueba para actualizar",
      width: 1000,
      height: 800,
      scale: 10,
      unit: "metros"
    };

    const createResponse = await request(app)
      .post("/api/maps")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mapData);

    const mapId = createResponse.body.map._id;

    const updatedMapData = {
      name: "Updated Test Map",
      description: "Mapa actualizado",
      width: 1200,
      height: 900,
      scale: 12,
      unit: "pies"
    };

    const response = await request(app)
      .put(`/api/maps/${mapId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send(updatedMapData)
      .expect(200);

    expect(response.body.map).toBeDefined();
    expect(response.body.map._id).toBe(mapId);
    expect(response.body.map.name).toBe(updatedMapData.name);
    expect(response.body.map.description).toBe(updatedMapData.description);
    expect(response.body.map.width).toBe(updatedMapData.width);
    expect(response.body.map.height).toBe(updatedMapData.height);
    expect(response.body.map.scale).toBe(updatedMapData.scale);
    expect(response.body.map.unit).toBe(updatedMapData.unit);
  }, 20000);

  it("debería eliminar un mapa existente", async () => {
    const mapData = {
      name: "Test Map Delete",
      description: "Mapa de prueba para eliminar",
      width: 1000,
      height: 800,
      scale: 10,
      unit: "metros"
    };

    const createResponse = await request(app)
      .post("/api/maps")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(mapData);

    const mapId = createResponse.body.map._id;

    await request(app)
      .delete(`/api/maps/${mapId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    await request(app)
      .get(`/api/maps/${mapId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(404);
  }, 20000);

  it("no debería permitir acceder a mapas sin autenticación", async () => {
    await request(app)
      .get("/api/maps")
      .expect(401);
  }, 15000);

  it("debería refrescar el token y poder seguir accediendo a los mapas", async () => {
    const refreshUser = {
      username: "refreshuser",
      password: "password123"
    };

    await User.deleteOne({ username: refreshUser.username });
    
    await request(app)
      .post("/api/users/register")
      .send(refreshUser);
    
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(refreshUser);

    const refreshToken = loginResponse.body.refreshToken;

    const refreshResponse = await request(app)
      .post("/api/users/refresh-token")
      .send({ refreshToken })
      .expect(200);

    const newAccessToken = refreshResponse.body.accessToken;

    await request(app)
      .get("/api/maps")
      .set("Authorization", `Bearer ${newAccessToken}`)
      .expect(200);
  }, 20000); 
});