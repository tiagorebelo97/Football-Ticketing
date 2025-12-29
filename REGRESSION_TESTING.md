# Regression Testing Guide

## Overview

This project includes comprehensive regression test suites for all API applications to ensure that existing functionality is not broken when new changes are made.

## Test Structure

Each API application has its own test suite located in `src/__tests__/regression.test.ts`:

- **fan-api**: Tests for match listing and ticket purchasing endpoints
- **club-backoffice-api**: Tests for match management, NFC, venues, sports, reports, auth, user management (RBAC), members management, and quota management endpoints
- **pos-api**: Tests for NFC authentication, payment processing, and refund endpoints
- **entry-api**: Tests for ticket validation and capacity tracking endpoints
- **super-admin-api**: Tests for club provisioning, authentication, NFC stock, fee configuration, and platform management endpoints

## Running Tests

### Run all regression tests

```bash
npm run test:regression
```

### Run tests for a specific API

```bash
# Fan API
cd apps/fan-api
npm test

# Club Backoffice API
cd apps/club-backoffice-api
npm test

# POS API
cd apps/pos-api
npm test

# Entry API
cd apps/entry-api
npm test

# Super Admin API
cd apps/super-admin-api
npm test
```

### Run tests in watch mode (during development)

```bash
cd apps/[api-name]
npm run test:watch
```

### Run tests with coverage

```bash
cd apps/[api-name]
npm run test:coverage
```

## Automated Testing with Git Hooks

The regression tests are automatically run before every `git push` operation thanks to Husky pre-push hooks.

### How it works

1. When you attempt to push code to the repository, the pre-push hook is triggered
2. The hook runs `npm run test:regression` which executes all regression tests
3. If any test fails, the push is aborted and you'll see which tests failed
4. Fix the issues, commit your changes, and try pushing again

### Bypassing the hook (NOT RECOMMENDED)

In exceptional circumstances, you can bypass the pre-push hook:

```bash
git push --no-verify
```

**Warning**: Only use this when absolutely necessary, as it skips the safety check that ensures code quality.

## Test Philosophy

These regression tests follow these principles:

1. **Non-invasive**: Tests don't require a running database or external services. They test the API structure and routing.

2. **Fast**: All tests run quickly, allowing for rapid feedback during development.

3. **Focused**: Each test verifies that endpoints exist and respond appropriately, without testing business logic in detail.

4. **Maintainable**: Tests are structured to be easy to update when APIs change.

## Updating Tests

### When to update regression tests

Update the regression tests whenever you:

1. Add a new endpoint to any API
2. Remove an endpoint from any API
3. Change the expected behavior of an endpoint (e.g., change return codes)
4. Modify the request/response structure of an endpoint

### How to add tests for new endpoints

1. Open the relevant test file: `apps/[api-name]/src/__tests__/regression.test.ts`

2. Add a new test case in the appropriate describe block:

```typescript
it('should handle GET /api/new-endpoint', async () => {
  const response = await request(app)
    .get('/api/new-endpoint');

  expect(response.status).not.toBe(404);
  expect([200, 400, 401, 500]).toContain(response.status);
});
```

3. Run the tests to ensure they pass:

```bash
cd apps/[api-name]
npm test
```

4. Commit the updated test file with your changes

## Continuous Integration

These regression tests should be integrated into your CI/CD pipeline to ensure that:

1. Every pull request is tested before merging
2. No code is deployed to production without passing tests
3. Test results are visible to all team members

Example GitHub Actions workflow (create `.github/workflows/test.yml`):

```yaml
name: Regression Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run regression tests
      run: npm run test:regression
```

## Troubleshooting

### Tests are failing after I made changes

1. Review the error messages to understand which tests are failing
2. Check if your changes broke existing functionality
3. If the changes are intentional, update the tests to match the new behavior
4. If the changes are unintentional, fix your code to restore the original behavior

### Git hook is not running

1. Ensure Husky is installed: `npm install`
2. Check that the hook file exists: `ls -la .husky/pre-push`
3. Ensure the hook is executable: `chmod +x .husky/pre-push`
4. Verify the prepare script ran: `npm run prepare`

### Tests are running too slowly

The regression tests are designed to be fast. If they're slow:

1. Check if you accidentally started external services (database, Redis, etc.)
2. Review any tests you added to ensure they're not making external calls
3. Consider running tests in parallel if needed

## Best Practices

1. **Run tests frequently**: Don't wait until you push to discover issues
2. **Keep tests updated**: Update tests as soon as you change APIs
3. **Write meaningful tests**: Each test should verify a specific behavior
4. **Don't skip tests**: The pre-push hook is there for a reason
5. **Review test failures carefully**: Failed tests indicate real problems

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Husky Documentation](https://typicode.github.io/husky/)
