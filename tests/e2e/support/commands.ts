/// <reference types="cypress" />

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to register a new user
             * @example cy.registerUser({ name: 'Test', email: 'test@test.com', ... })
             */
            registerUser(userData: {
                name: string;
                email: string;
                password: string;
                cpf: string;
                phone: string;
                birthDate: string;
            }): Chainable<{
                accessToken: string;
                refreshToken: string;
                userId: string;
            }>;

            /**
             * Custom command to login and get tokens
             * @example cy.login('email@test.com', 'password123')
             */
            login(email: string, password: string): Chainable<{
                accessToken: string;
                refreshToken: string;
            }>;

            /**
             * Custom command to login as admin
             * @example cy.loginAsAdmin()
             */
            loginAsAdmin(): Chainable<{
                accessToken: string;
                refreshToken: string;
            }>;

            /**
             * Custom command to make authenticated API request
             * @example cy.apiRequest('GET', '/products', token)
             */
            apiRequest(
                method: string,
                url: string,
                token?: string,
                body?: object
            ): Chainable<Cypress.Response<any>>;

            /**
             * Custom command to create a product via API (requires admin)
             * @example cy.createProduct(adminToken, productData)
             */
            createProduct(
                token: string,
                productData: object
            ): Chainable<{ productId: string }>;

            /**
             * Custom command to add item to cart
             * @example cy.addToCart(token, productId, quantity)
             */
            addToCart(
                token: string | null,
                productId: string,
                quantity: number
            ): Chainable<Cypress.Response<any>>;
        }
    }
}

// Generate valid CPF for tests
function generateCPF(): string {
    const randomDigits = () => Math.floor(Math.random() * 9);
    const cpfArray = Array.from({ length: 9 }, randomDigits);

    // Calculate first verifier digit
    let sum = cpfArray.reduce((acc, digit, idx) => acc + digit * (10 - idx), 0);
    let firstVerifier = (sum * 10) % 11;
    if (firstVerifier === 10) firstVerifier = 0;
    cpfArray.push(firstVerifier);

    // Calculate second verifier digit
    sum = cpfArray.reduce((acc, digit, idx) => acc + digit * (11 - idx), 0);
    let secondVerifier = (sum * 10) % 11;
    if (secondVerifier === 10) secondVerifier = 0;
    cpfArray.push(secondVerifier);

    return cpfArray.join('');
}

// Register a new user
Cypress.Commands.add('registerUser', (userData) => {
    const apiUrl = Cypress.env('apiUrl');

    return cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/register`,
        body: {
            ...userData,
            passwordConfirm: userData.password,
        },
        failOnStatusCode: false,
    }).then((response) => {
        if (response.status === 201) {
            return {
                accessToken: response.body.data.accessToken,
                refreshToken: response.body.data.refreshToken,
                userId: response.body.data.user.userId,
            };
        }
        throw new Error(`Registration failed: ${JSON.stringify(response.body)}`);
    });
});

// Login with credentials
Cypress.Commands.add('login', (email, password) => {
    const apiUrl = Cypress.env('apiUrl');

    return cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/login`,
        body: { email, password },
        failOnStatusCode: false,
    }).then((response) => {
        if (response.status === 200) {
            return {
                accessToken: response.body.data.accessToken,
                refreshToken: response.body.data.refreshToken,
            };
        }
        throw new Error(`Login failed: ${JSON.stringify(response.body)}`);
    });
});

// Login as admin (uses predefined admin credentials)
Cypress.Commands.add('loginAsAdmin', () => {
    const adminEmail = Cypress.env('ADMIN_EMAIL') || 'admin@admin.com';
    const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'admin123';

    return cy.login(adminEmail, adminPassword);
});

// Make authenticated API request
Cypress.Commands.add('apiRequest', (method, url, token?, body?) => {
    const apiUrl = Cypress.env('apiUrl');
    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return cy.request({
        method,
        url: `${apiUrl}${url}`,
        headers,
        body,
        failOnStatusCode: false,
    });
});

// Create a product (admin only)
Cypress.Commands.add('createProduct', (token, productData) => {
    const apiUrl = Cypress.env('apiUrl');

    return cy.request({
        method: 'POST',
        url: `${apiUrl}/admin/products`,
        headers: { Authorization: `Bearer ${token}` },
        body: productData,
        failOnStatusCode: false,
    }).then((response) => {
        if (response.status === 201) {
            return { productId: response.body.data.id };
        }
        throw new Error(`Create product failed: ${JSON.stringify(response.body)}`);
    });
});

// Add item to cart
Cypress.Commands.add('addToCart', (token, productId, quantity) => {
    const apiUrl = Cypress.env('apiUrl');
    const headers: Record<string, string> = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return cy.request({
        method: 'POST',
        url: `${apiUrl}/cart/items`,
        headers,
        body: { productId, quantity },
        failOnStatusCode: false,
    });
});

// Export generateCPF for use in tests
Cypress.env('generateCPF', generateCPF);

export { };
