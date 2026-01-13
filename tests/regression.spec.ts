import { test, expect } from '@playwright/test';
import { Loginpage } from '../pages/Loginpage';
import testData from '../test-data/testData.json';

test.beforeEach('goto login page', async ({ page }) => {
    const loginPage = new Loginpage(page);
    await loginPage.goto();
    await loginPage.login(testData.admin.username, testData.admin.password);
});

test('Primary application tree view toggle', async ({ page }) => {
    const toggle = page.getByRole('switch', { name: 'Primary Application' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await page.screenshot({ path: 'Screenshots/Home page.png', fullPage: true });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
})

test('Network interception', async ({ page, request }) => {
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
    await page.pause();
    await expect(page.getByRole('row', { name: "Application-1" })).toBeVisible();
})

test.describe.serial('Serial execution - API trsting', () => {
    test('Create app', async ({ page }) => {
        await page.getByRole('button', { name: 'Create Application' }).click();
        await page.getByLabel('Name').fill('App1');
        await page.getByLabel('Description').fill('App desc 1');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Application Created Successfully')).toBeVisible();
    });

    test('Get created app', async ({ page }) => {
        await expect(page.getByRole('row', { name: 'App1' })).toBeVisible();
    });

    test('Delete app', async ({ page }) => {
        await page.getByRole('button').filter({ hasText: 'delete' }).first().click();
        await page.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText('Application Deleted Successfully')).toBeVisible();
    });
})

test.afterEach('Status check', async ({ page }) => {
    if (test.info().status !== test.info().expectedStatus)
        console.log(`Unexpected outcome. Test Failed!!!`);
    if (test.info().status == test.info().expectedStatus)
        console.log(`Expected outcome. Test Passed!!!`);
});

// test.describe.serial('Serial execution - API trsting', () => {
//     const BASE_API_URL = process.env.BASE_API_URL;

//     test.beforeEach('POST call', async ({ request }) => {

//         const postresponse = await request.post(`${BASE_API_URL}/application`, {
//             data: {
//             id: '123abc',
//             name: 'App1',
//             description: 'App desc 1'
//             }
//         });
//         expect(postresponse.status()).toBe(200);

//     });

//     test('@serial regression API Testing - GET application', async ({ request }) => {
        
//         const getresponse = await request.get(`${BASE_API_URL}/application`);
//         expect(getresponse.status()).toBe(200);

//     });

//     test('@serial regression API Testing - PUT application', async ({ request }) => {
    
//         const putresponse = await request.put(`${BASE_API_URL}/application/123abc`, {
//             data: {
//             name: 'App1 - updated',
//             description: 'App desc 1 - updated'
//             }
//         });
//         expect(putresponse.status()).toBe(200);

//     });

//     test('@serial regression API Testing - DELETE application', async ({ request }) => {

//         const deleteresponse = await request.delete(`${BASE_API_URL}/application/123abc`);
//         expect(deleteresponse.status()).toBe(200);

//     });
// })