import request from 'supertest';
import { app } from './app';

describe('API Integration Tests', () => {

  describe('GET /health', () => {
    it('should return 200 with healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('POST /orders', () => {
    it('should create a VIP order and return 201 with 20% discount', async () => {
      const response = await request(app)
        .post('/orders')
        .send({ id: 'cmd-999', amount: 100, isVip: true });

      expect(response.status).toBe(201);
      expect(response.body.amount).toBe(80);
      expect(response.body.status).toBe('PENDING');
    });

    it('should create a standard order without discount', async () => {
      const response = await request(app)
        .post('/orders')
        .send({ id: 'cmd-1000', amount: 100, isVip: false });

      expect(response.status).toBe(201);
      expect(response.body.amount).toBe(100);
    });

    it('should return 400 when id is missing', async () => {
      const response = await request(app)
        .post('/orders')
        .send({ amount: 100 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing id or amount');
    });

    it('should return 400 when amount is missing', async () => {
      const response = await request(app)
        .post('/orders')
        .send({ id: 'cmd-fail' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /products', () => {
    it('should create a physical product and return 201', async () => {
      const response = await request(app)
        .post('/products')
        .send({ id: 'prod-int-1', name: 'Laptop', price: 999, type: 'physical', stock: 10, category: 'electronics' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('prod-int-1');
      expect(response.body.stock).toBe(10);
      expect(response.body.type).toBe('physical');
    });

    it('should create a digital product with null stock', async () => {
      const response = await request(app)
        .post('/products')
        .send({ id: 'prod-int-2', name: 'E-Book', price: 15, type: 'digital', category: 'books' });

      expect(response.status).toBe(201);
      expect(response.body.stock).toBeNull();
      expect(response.body.type).toBe('digital');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/products')
        .send({ name: 'Produit sans ID' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Champs obligatoires manquants');
    });

    it('should return 400 when physical product has no stock', async () => {
      const response = await request(app)
        .post('/products')
        .send({ id: 'prod-int-3', name: 'Chaise', price: 200, type: 'physical', category: 'mobilier' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('stock valide');
    });
  });

  describe('GET /products', () => {
    it('should return the list of all products', async () => {
      await request(app)
        .post('/products')
        .send({ id: 'prod-list-1', name: 'Clavier', price: 80, type: 'physical', stock: 20, category: 'peripherals' });

      const response = await request(app).get('/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((p: { id: string }) => p.id === 'prod-list-1')).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      await request(app)
        .post('/products')
        .send({ id: 'prod-get-1', name: 'Souris', price: 40, type: 'physical', stock: 50, category: 'peripherals' });

      const response = await request(app).get('/products/prod-get-1');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Souris');
    });

    it('should return 404 for a non-existent product', async () => {
      const response = await request(app).get('/products/inexistant-xyz');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Produit introuvable');
    });
  });
});
