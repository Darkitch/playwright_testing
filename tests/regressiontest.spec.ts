import { test, expect } from '@playwright/test';

const BASE_API_URL = process.env.BASE_API_URL;
let applicationId: string;

test('@regression API - application CRUD', async ({ request }) => {
  const getresponse = await request.get(`${BASE_API_URL}/application`);
  expect(getresponse.status()).toBe(200);

  const postresponse = await request.post(`${BASE_API_URL}/application`, {
    data: {
      name: 'App1',
      description: 'App desc 1'
    }
  });
  expect(postresponse.status()).toBe(201);

  const postBody = await postresponse.json();
  expect(postBody.message).toBe('Application Created Successfully');

  const res = await request.get(`${BASE_API_URL}/application`);
  const body = await res.json();
  applicationId = body[0]?.application_id;

  const putresponse = await request.put(`${BASE_API_URL}/application/${applicationId}`, {
    data: {
      name: 'App1 - updated',
      description: 'App desc 1 - updated'
    }
  });
  expect(putresponse.status()).toBe(200);

  const deleteresponse = await request.delete(`${BASE_API_URL}/application/${applicationId}`);
  expect(deleteresponse.status()).toBe(200);
});
