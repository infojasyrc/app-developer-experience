import Page from '../core/Page'
const loginFixture = require('../../fixtures/login.json')

class Login extends Page {
  private url: string
  private userInput: string
  private passwordInput: string
  private loginButton: string

  constructor() {
    super(loginFixture)
    this.url = '/login'
    this.userInput = '#userName'
    this.passwordInput = '#password'
    this.loginButton = "[data-testid='login-button']"
  }

  navigate() {
    cy.visit(this.url)
  }

  getUserInput() {
    return cy.get(this.userInput)
  }

  getPasswordInput() {
    return cy.get(this.passwordInput)
  }

  getLoginButton() {
    return cy.get(this.loginButton)
  }

  clearLogin() {
    this.getUserInput().clear()
    this.getPasswordInput().clear()
  }

  loginToApp(user: string, password: string) {
    this.getUserInput().type(user)
    this.getPasswordInput().type(password)
    this.getLoginButton().click()
  }
}

export default Login
