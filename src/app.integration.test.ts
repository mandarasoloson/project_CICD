import request from 'supertest';
import { app } from './app';

describe('API Integration Tests', () => {
  
  it('should return 200 OK for /health (Monitoring Endpoint)', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  it('should create a VIP order and return 201', async () => {
    const response = await request(app)
      .post('/orders')
      .send({ id: 'cmd-999', amount: 100, isVip: true });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(80); 
  });

  it('should return 400 Bad Request if data is missing', async () => {
    const response = await request(app)
      .post('/orders')
      .send({ amount: 100 }); // Oups, j'ai oublié l'ID

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Missing id or amount');
  });
});