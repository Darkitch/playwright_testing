import { test, expect } from '@playwright/test';
import { Loginpage } from '../pages/Loginpage';
import testData from '../test-data/testData.json';

test.beforeEach('goto login page', async ({ page }) => {
    const loginPage = new Loginpage(page);
    await loginPage.goto();
    await loginPage.login(testData.admin.username, testData.admin.password);
});

// test('Primary application tree view toggle', async ({ page }) => {
//     const toggle = page.getByRole('switch', { name: 'Primary Application' });
//     await expect(toggle).toBeVisible();
//     await expect(toggle).toHaveAttribute('aria-checked', 'true');
//     await page.screenshot({ path: 'Screenshots/Parent_app_only.png', fullPage: true });
//     await toggle.click();
//     await expect(toggle).toHaveAttribute('aria-checked', 'false');
//     await page.screenshot({ path: 'Screenshots/All_app.png', fullPage: true });
// })

test.describe.serial('Serial execution - API trsting', () => {

    // test.beforeEach('goto login page', async ({ page }) => {
    //     const loginPage = new Loginpage(page);
    //     await loginPage.goto();
    //     await loginPage.login(testData.admin.username, testData.admin.password);
    // });

    const project_path = process.env.PROJECT_PATH as string;

    test('Create primary application', async ({ page }) => {

        await page.getByRole('button', { name: 'Create Application' }).click();
        await page.getByLabel('Name').fill('Primary app1');
        await page.getByLabel('Description').fill('Primary app1 desc');
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Application Created Successfully')).toBeVisible();
    })

    test('Create sub application', async ({ page }) => {
        
        await page.getByRole('button', { name: 'Create Application' }).click();
        await page.getByLabel('Name').fill('Test app1');
        await page.getByLabel('Description').fill('test app1 desc');
        await page.locator('div').filter({ hasText: /^Primary Application$/ }).first().click();
        await page.getByRole('option', { name: 'Primary app1' }).click();
        await page.getByRole('textbox', { name: 'Path' }).fill(project_path);
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Application Created Successfully')).toBeVisible();
    })

    test('Create assessment', async ({ page }) => {
        
        await page.locator('mat-list-item').filter({ hasText: 'assessmentsAssessments' }).click();
        await expect(page.getByRole('heading', { name: 'Application Assessments' })).toBeVisible();
        await page.getByRole('button', { name: 'Create Assessment' }).click();
        await page.locator('div').filter({ hasText: /^Application$/ }).first().click();
        await page.getByRole('option', { name: 'Test app1' }).click();
        await page.getByRole('checkbox', { name: 'Cloud Readiness Check', exact: true }).click();
        await page.getByRole('checkbox', { name: 'Portfolio Discovery', exact: true }).click();
        await page.getByRole('checkbox', { name: 'Code & Architecture Scan', exact: true }).click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByRole('cell', { name: 'Test app1' })).toBeVisible();
    })

    test('Assessment completion', async ({ page }) => {
        await page.locator('mat-list-item').filter({ hasText: 'assessmentsAssessments' }).click();
        // dashboard
        await page.locator('button').nth(4).click();
        await expect(page.getByText('Overall Score')).toBeVisible();
        await page.getByRole('link', { name: 'Assessments' }).click();
        // capture details
        await page.locator('app-button').nth(4).click();
        await page.locator('.option-card').first().click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Capture Detail Response saved')).toBeVisible();
        // open assessment
        await page.locator('button').nth(5).click();
        await page.locator('.option-card').first().click();
        await page.getByRole('button', { name: 'Next' }).click();
        await page.locator('.option-card').first().click();
        await page.getByRole('button', { name: 'Next' }).click();
        await page.locator('.option-card').first().click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();
        // review
        await page.getByRole('button').filter({ hasText: 'preview' }).first().click();
        await expect(page.getByText('Test app1')).toBeVisible();
        await page.getByRole('button', { name: 'Back' }).click();
        //Edit
        await page.getByRole('button').filter({ hasText: 'edit' }).first().click();
        await page.getByRole('checkbox', { name: 'Portfolio Discovery' }).click();
        await page.getByRole('checkbox', { name: 'Technical Debt Analysis' }).click();
        await page.getByRole('checkbox', { name: 'Security & Compliance' }).click();
        await page.getByRole('button', { name: 'Submit' }).click();
        await expect(page.getByText('Assessment Updated Successfully')).toBeVisible();
    })

    test('Delete applications', async ({ page }) => {
        await page.getByRole('button').filter({ hasText: 'arrow_forward' }).first().click();
        await page.getByRole('button').filter({ hasText: 'delete' }).click();
        await page.getByText('Delete', { exact: true }).click();
        await expect(page.getByText('Application Deleted')).toBeVisible();
        await page.getByRole('button').filter({ hasText: 'delete' }).first().click();
        await page.getByText('Delete', { exact: true }).click();
        await expect(page.getByText('Application Deleted')).toBeVisible();
    })

})
