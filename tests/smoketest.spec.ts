import { test, expect } from '@playwright/test';

const BASE_API_URL = process.env.BASE_API_URL;

test('@smoke API - application service is up', async ({ request }) => {
  const response = await request.get(`${BASE_API_URL}/application`);
  expect(response.status()).toBe(200);
});
