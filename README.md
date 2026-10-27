# Marlin Dashboard

A Next.js 13+ application for monitoring vessels, analyzing data, and tracking real-time metrics. This project is the starting point for the Marlin Dashboard platform.

## Getting Started

### Prerequisites
* Node.js >= 18.x
* npm

### Install dependencies
```bash
npm install
```

### Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## Project Structure
```bash
src/
  app/         # App routes
  _components/ # UI components
  _lib/        # API clients
  _hooks/      # Custom React hooks
  _styles/     # Global CSS
  _types/      # TypeScript types and interfaces
  _utils/      # Small stateless helper functions
```

> Directories prefixed with _ are internal, not meant for direct route exposure.

## Testing

This project uses two testing frameworks, **Cypress** and **Jest**.

### Cypress
Used to test the behaviour of the application in the browser, e.g.:
- Full user journeys (login -> action -> result)
- UI interactions
- Component rendering in a real browser environment

### Jest
Used to test logic in the server-side parts of the application where the browser can’t reach, e.g.:
- Server-side data-fetching functions
- Access-control logic (role checks, token handling)
- Data-processing utilities
- React components that don’t depend on the browser

### Run tests

To open the interactive Cypress test runner:
```bash
npm run cypress:open
```

To run headless Cypress tests:
```bash
npm run cypress:e2e
npm run cypress:component
```

To run headless Jest tests:
```bash
npm run jest
```

### Testing login
Cypress uses a lightweight test authenticaion API (```/api/test-login```) to simulate users with different roles.

How it works:

1. The ```/api/test-login``` route accepts a role in the request body and returns a mock NextAuth session token.
2. The helper command ```cy.loginAs(role)``` calls this endpoint and sets the returned token as a next-auth.session-token cookie.
3. Tests can then visit protected routes (e.g. /dashboard) with the simulated permissions.

#### Rate limiter test

There is a test included for the login rate limiter and CAPTCHA flow that is commented out by default. This is because the test depends on the environment variable ```LOGIN_RATE_LIMIT_COUNT```, and in CI, environment variables cannot be adjusted per-test. If this test runs with the production value, it can break the whole suite.

How to run locally:

1. Set ```LOGIN_RATE_LIMIT_COUNT``` to a low value (e.g. 3) in your local ```.env``` file
2. Uncomment the test in ```cypress/e2e/login-page.ratelimit.cy.ts```
3. Run cypress open and execute the test in the Cypress runner.

## Environment Variables

Use the provided .env.example file as a template to create your own local environment file:
```bash
cp .env.example .env.local
```
This example file includes a few recommended defaults to simplify setup. Secret values such as authentication secrets, database credentials, and API keys will need to be added manually.

The ```ENABLE_TEST_LOGIN``` environment variable must never be enabled in production.
When set to "true", it exposes an endpoint that can issue valid session tokens without authentication.
This is intended strictly for local and CI testing.
