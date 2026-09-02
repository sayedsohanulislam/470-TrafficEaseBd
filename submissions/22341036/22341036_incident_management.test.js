const request = require('supertest');
const app = require('../app');

describe('Feature: Incident Management (Student ID: 22341036 - Sayed Sohanul Islam)', () => {
  let commuterToken = '';
  let adminToken = '';
  let createdIncidentId = '';

  // PRE-CONDITION: Dynamic Authentication Handling (No hardcoded tokens)
  beforeAll(async () => {
    // 1. Dynamically register & login a Commuter user
    const commuterUser = {
      name: 'Sayed Commuter Test',
      email: `sayed.test.${Date.now()}@trafficease.local`,
      phone: '01711223344',
      password: 'Password123!',
      role: 'Commuter'
    };

    const regRes = await request(app)
      .post('/api/auth/register')
      .send(commuterUser);
    
    commuterToken = regRes.body.token;

    // 2. Dynamically login Admin demo profile
    const adminRes = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'Admin' });

    adminToken = adminRes.body.token;
  });

  // ==========================================
  // CASE A: Positive Flow (Happy Path)
  // ==========================================
  describe('Case A: Positive Flow (Happy Path)', () => {
    // Test 1: Create Resource
    it('Test 1: should create a new incident report successfully (Status 201)', async () => {
      const payload = {
        title: 'Waterlogging at Mirpur 10 Circle',
        type: 'Flooding',
        severity: 'Critical',
        locationName: 'Mirpur 10 Roundabout',
        coordinates: [90.3687, 23.8069],
        description: 'Heavy rainfall has caused 2 feet water accumulation blocking all light vehicles.'
      };

      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${commuterToken}`)
        .send(payload);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(payload.title);
      expect(res.body.approvalStatus).toBe('Pending');
      expect(res.body.status).toBe('Open');

      // Store created ID for subsequent retrieval/update tests
      createdIncidentId = res.body._id;
    });

    // Test 2: Retrieve Resources
    it('Test 2a: should retrieve all approved public incidents (Status 200)', async () => {
      const res = await request(app).get('/api/incidents');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body).toHaveProperty('count');
    });

    it('Test 2b: should retrieve the specific created incident by ID (Status 200)', async () => {
      const res = await request(app)
        .get(`/api/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${commuterToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', createdIncidentId);
      expect(res.body.locationName).toBe('Mirpur 10 Roundabout');
    });

    it('Test 2c: should allow Admin to approve pending incident (Status 200)', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${createdIncidentId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.approvalStatus).toBe('Approved');
    });

    it('Test 2d: should allow Authority/Admin to update status to Investigating (Status 200)', async () => {
      const res = await request(app)
        .put(`/api/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Investigating' });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Investigating');
    });
  });

  // ==========================================
  // CASE B: Negative Flow (Error Handling)
  // ==========================================
  describe('Case B: Negative Flow (Error Handling)', () => {
    // Test 3: Validation Error (Missing required fields)
    it('Test 3a: should return 400 when required title is missing', async () => {
      const invalidPayload = {
        type: 'Accident',
        severity: 'High',
        locationName: 'Farmgate'
      };

      const res = await request(app)
        .post('/api/incidents')
        .set('Authorization', `Bearer ${commuterToken}`)
        .send(invalidPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('Test 3b: should return 400 when invalid status transition is requested', async () => {
      const res = await request(app)
        .put(`/api/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS_VALUE' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    // Test 4: Resource Not Found
    it('Test 4: should return 404 when querying a non-existent incident ID', async () => {
      const nonExistentId = 'mock-inc-999999999';

      const res = await request(app)
        .get(`/api/incidents/${nonExistentId}`)
        .set('Authorization', `Bearer ${commuterToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ==========================================
  // CASE C: Security & Boundary Conditions
  // ==========================================
  describe('Case C: Security & Boundary Conditions', () => {
    // Test 5: Unauthorized Access & Role Boundary
    it('Test 5a: should return 401 Unauthorized when creating an incident without token', async () => {
      const res = await request(app)
        .post('/api/incidents')
        .send({
          title: 'Unauthorized Incident Submission',
          type: 'Congestion',
          locationName: 'Dhanmondi 27'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('Test 5b: should return 403 Forbidden when a Commuter attempts to approve an incident', async () => {
      const res = await request(app)
        .patch(`/api/incidents/${createdIncidentId}/approve`)
        .set('Authorization', `Bearer ${commuterToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message');
    });

    it('Test 5c: should return 403 Forbidden when a Commuter attempts to delete an incident', async () => {
      const res = await request(app)
        .delete(`/api/incidents/${createdIncidentId}`)
        .set('Authorization', `Bearer ${commuterToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message');
    });
  });
});