const request = require('supertest');
const app = require('../app');

describe('Feature: Transit Route & Operations Management (Student ID: 22201631 - Md. Mushroor Muttakin Khan)', () => {
  let adminToken = '';
  let commuterToken = '';
  let createdRouteId = '';

  // PRE-CONDITION: Dynamic Authentication Handling
  beforeAll(async () => {
    // 1. Dynamic Admin login
    const adminRes = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'Admin' });
    adminToken = adminRes.body.token;

    // 2. Dynamic Commuter login
    const commuterRes = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'Commuter' });
    commuterToken = commuterRes.body.token;
  });

  // ==========================================
  // CASE A: Positive Flow (Happy Path)
  // ==========================================
  describe('Case A: Positive Flow (Happy Path)', () => {
    // Test 1: Create Resource (Add Transit Route)
    it('Test 1: should allow Admin/Authority to create a new transit route (Status 201)', async () => {
      const routePayload = {
        name: 'MRT Line 6 Feeder Express',
        mode: 'Bus',
        origin: 'Uttara North Station',
        destination: 'Motijheel Shapla Chattar',
        stops: ['Uttara North', 'Mirpur 10', 'Farmgate', 'Shahbagh', 'Motijheel'],
        fareBase: 35,
        headwayMinutes: 8
      };

      const res = await request(app)
        .post('/api/transit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(routePayload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(routePayload.name);
      expect(res.body.mode).toBe('Bus');

      createdRouteId = res.body._id;
    });

    // Test 2: Retrieve Resources
    it('Test 2a: should allow public retrieval of all registered transit routes (Status 200)', async () => {
      const res = await request(app).get('/api/transit');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('Test 2b: should allow Admin/Authority to update headway and fare of a route (Status 200)', async () => {
      const res = await request(app)
        .put(`/api/transit/${createdRouteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ headwayMinutes: 5, fareBase: 40 });

      expect(res.statusCode).toBe(200);
      expect(res.body.headwayMinutes).toBe(5);
    });
  });

  // ==========================================
  // CASE B: Negative Flow (Error Handling)
  // ==========================================
  describe('Case B: Negative Flow (Error Handling)', () => {
    // Test 3: Validation Error
    it('Test 3: should return 400 when route name or mode is missing', async () => {
      const res = await request(app)
        .post('/api/transit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ origin: 'Mirpur' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    // Test 4: Resource Not Found
    it('Test 4: should return 404 when updating non-existent transit route ID', async () => {
      const res = await request(app)
        .put('/api/transit/mock-route-99999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Ghost Route' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ==========================================
  // CASE C: Security & Boundary Conditions
  // ==========================================
  describe('Case C: Security & Boundary Conditions', () => {
    it('Test 5a: should return 401 Unauthorized when adding a transit route without token', async () => {
      const res = await request(app)
        .post('/api/transit')
        .send({
          name: 'Unauthorized Route',
          mode: 'Bus',
          origin: 'Mirpur',
          destination: 'Gulshan'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('Test 5b: should return 403 Forbidden when a Commuter role attempts to create a transit route', async () => {
      const res = await request(app)
        .post('/api/transit')
        .set('Authorization', `Bearer ${commuterToken}`)
        .send({
          name: 'Commuter Created Route',
          mode: 'Bus',
          origin: 'Dhanmondi',
          destination: 'Shahbagh'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message');
    });
  });
});