/// <reference types="cypress" />

import './commands';

// Runs before each test file
beforeEach(() => {
    // Log the current test name for debugging
    cy.log(`Running: ${Cypress.currentTest.title}`);
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
    // Return false to prevent Cypress from failing the test on uncaught exceptions
    // This is useful for API testing where we might get errors from the server
    console.error('Uncaught exception:', err.message);
    return false;
});
