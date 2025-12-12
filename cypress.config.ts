import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        specPattern: 'tests/e2e/**/*.cy.ts',
        supportFile: 'tests/e2e/support/e2e.ts',
        video: false,
        screenshotOnRunFailure: true,
        defaultCommandTimeout: 10000,
        requestTimeout: 10000,
        responseTimeout: 30000,
        retries: {
            runMode: 2,
            openMode: 0,
        },
        env: {
            apiUrl: '/api/v1',
            ADMIN_EMAIL: 'admin@admin.com',
            ADMIN_PASSWORD: 'Password123!',
        },
        setupNodeEvents(on, config) {
            // Node event listeners can be implemented here
            return config;
        },
    },
});
