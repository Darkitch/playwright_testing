import { test, expect } from '@playwright/test';
import { Loginpage } from '../pages/Loginpage';
import testData from '../test-data/testData.json';

test.describe.parallel('Parallel execution', () => {
    const BASE_API_URL = process.env.BASE_API_URL;
    let applicationId: string;

    test.beforeEach('goto login page', async ({ page }) => {
        const loginPage = new Loginpage(page);
        await loginPage.goto();
        await loginPage.login(testData.admin.username, testData.admin.password);
    });

    test.afterEach('Status check', async ({ page }) => {
        if (test.info().status !== test.info().expectedStatus)
            console.log(`Unexpected outcome. Test Failed!!!`);
        if (test.info().status == test.info().expectedStatus)
            console.log(`Expected outcome. Test Passed!!!`);
    });

    test('Network interception along with DELETE call', async ({ page, request }) => {
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
        const res = await request.get(`${BASE_API_URL}/application`);
        const body = await res.json();
        applicationId = body[0]?.application_id;
        const deleteresponse = await request.delete(`${BASE_API_URL}/application/${applicationId}`);
        expect(deleteresponse.status()).toBe(200);
    })

    test('regression API Testing - application CRUD', async ({ request }) => {
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

    test('network interception - full application CRUD mocked', async ({ page }) => {

        let applications = [
            {
            application_id: 'abc123',
            name: 'Application-1',
            description: 'Mocked app'
            }
        ];

        await page.route('**/api/v1/application**', async route => {
            const method = route.request().method();
            const url = route.request().url();

            if (method === 'GET') {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(applications),
            });
            }

            if (method === 'POST') {
            const body = await route.request().postDataJSON();
            const newApp = {
                application_id: 'xyz999',
                ...body,
            };
            applications.push(newApp);

            return route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                message: 'Application Created Successfully',
                data: newApp,
                }),
            });
            }

            if (method === 'PUT') {
            const body = await route.request().postDataJSON();
            applications[0] = { ...applications[0], ...body };

            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                message: 'Application Updated Successfully',
                }),
            });
            }

            if (method === 'DELETE') {
            applications = [];

            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                message: 'Application Deleted Successfully',
                }),
            });
            }

            await route.continue();
        });

        await expect(page.getByRole('row', { name: 'Application-1' })).toBeVisible();

        await page.getByRole('button', { name: 'Create Application' }).click();
        await page.getByLabel('Name').fill('App1');
        await page.getByLabel('Description').fill('App desc 1');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Application Created Successfully')).toBeVisible();

        await page.getByRole('button').filter({ hasText: 'delete' }).first().click();
        await page.getByRole('button', { name: 'Delete' }).click();
        await expect(page.getByText('Application Deleted Successfully')).toBeVisible();
    });

});