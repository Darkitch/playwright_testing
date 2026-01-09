import { Page, Locator } from '@playwright/test';

export class Loginpage {
  readonly page: Page;
  readonly GetstartedButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.GetstartedButton = page.getByRole('button', { name: 'Get Started' });
    this.usernameInput = this.page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = this.page.getByRole('textbox', { name: 'Password' });
    this.loginButton = this.page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    const baseUrl = process.env.BASE_URL as string;
    await this.page.goto(baseUrl);
    await this.GetstartedButton.click();
  }

  async submitEmptyForm() {
    await this.loginButton.click();
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
