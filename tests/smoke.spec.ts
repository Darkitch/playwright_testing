import { test, expect } from '@playwright/test';
import { Loginpage } from '../pages/Loginpage';
import testData from '../test-data/testData.json';

const baseUrl = process.env.BASE_URL as string;

test('@smoke UI - Get started button works', async ({ page }) => {
  await page.goto(baseUrl);
  page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
});

test('@smoke UI - Login button works', async ({ page }) => {
  const loginPage = new Loginpage(page);
  await loginPage.goto();
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Username is required')).toBeVisible();
});

test('@smoke - form fields editable', async ({ page }) => {
  const loginPage = new Loginpage(page);
  await loginPage.goto();
  await expect(page.getByRole('textbox', { name: 'Username' })).toBeEditable();
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeEditable();
});

test('@smoke UI - applications page loads', async ({ page }) => {
  const loginPage = new Loginpage(page);
  await loginPage.goto();
  await loginPage.login(testData.admin.username, testData.admin.password);
  await expect(page.locator('span.crumb.no-crumb')).toHaveText('Applications');
});

test('@smoke UI - create application button working', async ({ page }) => {
  const loginPage = new Loginpage(page);
  await loginPage.goto();
  await loginPage.login(testData.admin.username, testData.admin.password);
  await page.getByRole('button', { name: 'Create Application' }).click();
  await expect(page.getByLabel('Name')).toBeVisible();
});