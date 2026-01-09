import { test, expect } from '@playwright/test';
import { Loginpage } from '../pages/Loginpage';
import testData from '../test-data/testData.json';

const BASE_API_URL = process.env.BASE_API_URL;
let applicationId: string;

test('@login', async ({ browser }) => {
  const context = await browser.newContext();
  const adminPage = await context.newPage();
  const adminLogin = new Loginpage(adminPage);
  await adminLogin.goto();
  await adminLogin.login(testData.admin.username, testData.admin.password);
  await adminPage.waitForURL('**/applications');
  await expect(adminPage.locator('span.crumb.no-crumb')).toHaveText('Applications');
});

test('@validation - smoke', async ({ page }) => {
  const loginPage = new Loginpage(page);
  await loginPage.goto();
  await loginPage.submitEmptyForm();
  await expect(page.getByText('Username is required')).toBeVisible();
  await expect(page.getByText('Password is required')).toBeVisible();
  await loginPage.login(testData.invalid.username, testData.invalid.password);
  await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible();
});

test('@smoke API - application service is up', async ({ request }) => {
  const response = await request.get(`${BASE_API_URL}/application`);
  expect(response.status()).toBe(200);
});

test.describe.serial('@serial Assessment API testing', () => {

  test('goto login page with fake data', async ({ page }) => {
    await page.route('**/api/v1/application**', async route => {
        const fakeResponse = {
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
        {
            "application_id": "abc123",
            "name": "Application-1"
        }]),
        };
        await route.fulfill(fakeResponse);
    })
    const loginPage = new Loginpage(page);
    await loginPage.goto();
    await loginPage.login(testData.admin.username, testData.admin.password);
    await expect(page.getByRole('row', { name: "Application-1" })).toBeVisible();
  });

  test('@mocking API response', async ({ page, request }) => {
    const res = await request.get(`${BASE_API_URL}/application`);
    const body = await res.json();
    applicationId = body[0]?.application_id;
    const deleteresponse = await request.delete(`${BASE_API_URL}/application/${applicationId}`);
    expect(deleteresponse.status()).toBe(200);
  })
});
