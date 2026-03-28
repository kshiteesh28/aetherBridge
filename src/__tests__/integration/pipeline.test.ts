import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { ActionPackBuilder } from '../../domains/reasoning/action-pack.builder';

// Mocking external Google Cloud services for isolated integration test
vi.mock('@google-cloud/vertexai', () => ({
  VertexAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          candidates: [{
            content: { parts: [{ text: JSON.stringify({ intent: 'MEDICAL_TRIAGE', entities: { location: '123 Main St' }, confidence: 0.95 }) }] }
          }]
        }
      })
    })
  }))
}));

vi.mock('@google-cloud/storage', () => ({
  Storage: vi.fn().mockImplementation(() => ({
    bucket: vi.fn().mockReturnValue({
      file: vi.fn().mockReturnValue({
        getSignedUrl: vi.fn().mockResolvedValue(['https://mock-gcs-url.com/upload'])
      })
    })
  }))
}));

vi.mock('firebase-admin', () => ({
  apps: { length: 1 },
  initializeApp: vi.fn(),
  auth: vi.fn().mockReturnValue({
    verifyIdToken: vi.fn().mockResolvedValue({ uid: 'mock-user-id' })
  })
}));

describe('AetherBridge Integration Pipeline', () => {
  it('should pass health checks', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('should generate a secure GCS upload URL during intake', async () => {
    const res = await request(app)
      .post('/api/v1/intake')
      .set('Authorization', 'Bearer mock-firebase-token')
      .send({ type: 'audio' });

    expect(res.status).toBe(202);
    expect(res.body.status).toBe('PENDING');
    expect(res.body.upload_url).toContain('https://mock-gcs-url.com');
  });

  it('ActionPackBuilder enforces 0.85 evaluation threshold strictly', () => {
    const output = ActionPackBuilder.build('evt-001', {
      intent: 'SOS',
      confidence: 0.90,
      entities: {}
    });
    expect(output.verification.status).toBe('VERIFIED');

    const lowConfidence = ActionPackBuilder.build('evt-002', {
      intent: 'UNKNOWN',
      confidence: 0.50,
      entities: {}
    });
    expect(lowConfidence.verification.status).toBe('REQUIRES_REVIEW');
  });
});
