import { test, expect } from '@playwright/test';

test.describe('Auth Bounded Context - Impersonate E2E Tests', () => {
  test('should successfully impersonate and then stop impersonation when calling auth controller endpoints', async ({ request }) => {
    // 1. Trigger impersonate API as super_admin
    const impersonateResponse = await request.post('/api/auth/impersonate', {
      data: {
        targetUserId: 'target-user-uuid-123'
      }
    });

    expect(impersonateResponse.status()).toBe(200);
    const impersonateResult = await impersonateResponse.json();
    expect(impersonateResult.success).toBe(true);

    // 2. Trigger stop impersonation API
    const stopResponse = await request.post('/api/auth/stop-impersonation');
    expect(stopResponse.status()).toBe(200);
    const stopResult = await stopResponse.json();
    expect(stopResult.success).toBe(true);
  });

  test('should reject impersonate requests when targetUserId is missing', async ({ request }) => {
    const response = await request.post('/api/auth/impersonate', {
      data: {}
    });

    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.error).toContain('targetUserId is required');
  });
});
