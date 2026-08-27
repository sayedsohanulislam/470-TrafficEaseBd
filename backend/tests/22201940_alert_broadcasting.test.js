const request = require('supertest');
const app = require('../app');

describe('Feature: Authority Alerts & Safety Broadcasting (Student ID: 22201940 - Raisha Tasnim Khan)', () => {
  let adminToken = '';
  let commuterToken = '';
  let createdAlertId = '';

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
    // Test 1: Create Resource (Broadcast Alert)
    it('Test 1: should allow Admin/Authority to broadcast a new traffic emergency alert (Status 201)', async () => {
      const alertPayload = {
        title: 'Emergency Road Closure at Farmgate',
        message: 'Severe waterlogging and electrical line repair near Farmgate footbridge. Avoid area.',
        area: 'Farmgate',
        severity: 'Critical'
      };

      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(alertPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(alertPayload.title);
      expect(res.body.area).toBe('Farmgate');
      expect(res.body.active).toBe(true);

      createdAlertId = res.body._id;
    });

    // Test 2: Retrieve Resources
    it('Test 2a: should allow public retrieval of all active traffic alerts (Status 200)', async () => {
      const res = await request(app).get('/api/alerts');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBeGreaterThan(0);
    });

    it('Test 2b: should allow Admin/Authority to update active status of an alert (Status 200)', async () => {
      const res = await request(app)
        .put(`/api/alerts/${createdAlertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ severity: 'Medium', active: false });

      expect(res.statusCode).toBe(200);
      expect(res.body.active).toBe(false);
    });
  });

  // ==========================================
  // CASE B: Negative Flow (Error Handling)
  // ==========================================
  describe('Case B: Negative Flow (Error Handling)', () => {
    // Test 3: Validation Error
    it('Test 3: should return 400 when alert title or message is missing', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ area: 'Gulshan' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    // Test 4: Resource Not Found
    it('Test 4: should return 404 when updating non-existent alert ID', async () => {
      const res = await request(app)
        .put('/api/alerts/mock-alert-99999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ message: 'Update text' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ==========================================
  // CASE C: Security & Boundary Conditions
  // ==========================================
  describe('Case C: Security & Boundary Conditions', () => {
    it('Test 5a: should return 401 Unauthorized when broadcasting an alert without token', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .send({
          title: 'Unauthorized Alert',
          message: 'This should fail',
          area: 'All Dhaka'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('Test 5b: should return 403 Forbidden when a Commuter role attempts to broadcast an alert', async () => {
      const res = await request(app)
        .post('/api/alerts')
        .set('Authorization', `Bearer ${commuterToken}`)
        .send({
          title: 'Fake Commuter Alert',
          message: 'Trying to broadcast as commuter',
          area: 'Dhanmondi'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message');
    });
  });
});