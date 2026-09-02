const request = require('supertest');
const app = require('../app');

describe('Feature: Authentication & User Access System (Student ID: 23301060 - Maisha Maliha Nisa)', () => {
  let registeredEmail = '';
  const testPassword = 'Password123!';
  let userAuthToken = '';

  // PRE-CONDITION: Dynamic setup
  beforeAll(async () => {
    registeredEmail = `nisa.user.${Date.now()}@trafficease.local`;
  });

  // ==========================================
  // CASE A: Positive Flow (Happy Path)
  // ==========================================
  describe('Case A: Positive Flow (Happy Path)', () => {
    // Test 1: Create Resource (Register new user)
    it('Test 1: should register a new commuter account successfully (Status 201)', async () => {
      const newUser = {
        name: 'Nisa Maliha Test',
        email: registeredEmail,
        phone: '01811223344',
        password: testPassword,
        role: 'Commuter'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(registeredEmail);
      expect(res.body.role).toBe('Commuter');

      userAuthToken = res.body.token;
    });

    // Test 2: Retrieve Resource / Authenticate
    it('Test 2a: should login successfully with valid credentials and return JWT token (Status 200)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registeredEmail,
          password: testPassword
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(registeredEmail);
    });

    it('Test 2b: should support 1-click Demo Login for rapid simulation (Status 200)', async () => {
      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({ role: 'Commuter' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.role).toBe('Commuter');
    });
  });

  // ==========================================
  // CASE B: Negative Flow (Error Handling)
  // ==========================================
  describe('Case B: Negative Flow (Error Handling)', () => {
    // Test 3: Validation Error
    it('Test 3a: should return 400 when registering with missing required password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Incomplete User',
          email: `incomplete.${Date.now()}@trafficease.local`,
          phone: '01911223344',
          role: 'Commuter'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('Test 3b: should return 400 when attempting duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Attempt',
          email: registeredEmail,
          phone: '01811223344',
          password: testPassword,
          role: 'Commuter'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    // Test 4: Resource Not Found / Invalid Credentials
    it('Test 4: should return 401 when logging in with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registeredEmail,
          password: 'WRONG_PASSWORD_999'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  // ==========================================
  // CASE C: Security & Boundary Conditions
  // ==========================================
  describe('Case C: Security & Boundary Conditions', () => {
    it('Test 5a: should reject login payload missing email and password with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('Test 5b: should reject demo login with invalid non-existent role', async () => {
      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({ role: 'SuperHackerRole' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });
});