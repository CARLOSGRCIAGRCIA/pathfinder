import request from 'supertest';
import app from '../../../src/app';

let accessToken;
let refreshToken;

describe('Pruebas E2E - Usuarios y Mapas', () => {
  test('Registro de usuario', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ username: 'zephyr', password: '150122' });
    expect(response.status).toBe(201);
  });

  test('Inicio de sesión', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ username: 'zephyr', password: '150122' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  test('Refrescar token', async () => {
    const response = await request(app)
      .post('/api/users/refresh-token')
      .send({ refreshToken });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    accessToken = response.body.accessToken;
  });

  test('Obtener perfil de usuario', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username');
  });

  test('Crear un mapa', async () => {
    const response = await request(app)
      .post('/api/maps')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Ciudad Norte',
        width: 100,
        height: 100,
        start: { x: 5, y: 5 },
        end: { x: 95, y: 95 }
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('Agregar obstáculos a un mapa', async () => {
    const response = await request(app)
      .post('/api/obstacles/1234')
      .set('Authorization', `Bearer ${accessToken}`)
      .send([
        { x: 15, y: 25, size: 3 },
        { x: 35, y: 10, size: 2 },
        { x: 75, y: 85, size: 3 }
      ]);
    expect(response.status).toBe(201);
  });

  test('Agregar waypoints a un mapa', async () => {
    const response = await request(app)
      .post('/api/waypoints/1234') 
      .set('Authorization', `Bearer ${accessToken}`)
      .send([
        { x: 10, y: 15, name: 'Estación Norte' },
        { x: 25, y: 30, name: 'Plaza Principal' },
        { x: 40, y: 45, name: 'Mercado Central' },
        { x: 55, y: 60, name: 'Biblioteca Municipal' },
        { x: 70, y: 75, name: 'Centro Deportivo' },
        { x: 85, y: 90, name: 'Mirador' },
        { x: 30, y: 70, name: 'Parque Industrial' },
        { x: 65, y: 15, name: 'Universidad' },
        { x: 90, y: 50, name: 'Hospital General' },
        { x: 15, y: 85, name: 'Terminal de Buses' }
      ]);
    expect(response.status).toBe(201);
  });
});
