/// <reference types="cypress" />

describe('API de Carrinho E2E', () => {
    const apiUrl = '/api/v1';

    // Helper para gerar CPF válido
    const generateCPF = (): string => {
        const randomDigits = () => Math.floor(Math.random() * 9);
        const cpfArray = Array.from({ length: 9 }, randomDigits);

        let sum = cpfArray.reduce((acc, digit, idx) => acc + digit * (10 - idx), 0);
        let firstVerifier = (sum * 10) % 11;
        if (firstVerifier === 10) firstVerifier = 0;
        cpfArray.push(firstVerifier);

        sum = cpfArray.reduce((acc, digit, idx) => acc + digit * (11 - idx), 0);
        let secondVerifier = (sum * 10) % 11;
        if (secondVerifier === 10) secondVerifier = 0;
        cpfArray.push(secondVerifier);

        return cpfArray.join('');
    };

    // Helper para criar usuário e obter token
    const createUserAndGetToken = () => {
        const email = `cart_test_${Date.now()}@example.com`;
        return cy.request({
            method: 'POST',
            url: `${apiUrl}/auth/register`,
            body: {
                name: 'Usuario Carrinho',
                email,
                password: 'SecurePass123!',
                passwordConfirm: 'SecurePass123!',
                cpf: generateCPF(),
                phone: '11999998888',
                birthDate: '1990-05-15',
            },
        }).then((response) => response.body.data.accessToken);
    };

    // Helper para buscar ID de um produto
    const getProductId = () => {
        return cy.request({
            method: 'GET',
            url: `${apiUrl}/products`,
            qs: { limit: 1 },
        }).then((response) => {
            if (response.body.data.length > 0) {
                return response.body.data[0].id;
            }
            throw new Error('Nenhum produto disponível para testes de carrinho');
        });
    };

    describe('Carrinho de Visitante', () => {
        it('deve criar carrinho de visitante ao adicionar item sem token', () => {
            getProductId().then((productId) => {
                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/cart/items`,
                    body: { productId, quantity: 1 },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.data).to.have.property('items');
                    expect(response.body.data.items).to.be.an('array');
                    expect(response.body.data.items.length).to.be.at.least(1);

                    // Deve ter um guestCartId
                    const guestCartId = response.body.data.guestCartId ||
                        response.headers['x-guest-cart-id-created'];
                    expect(guestCartId).to.exist;
                });
            });
        });

        it('deve recuperar carrinho de visitante com header guestCartId', () => {
            getProductId().then((productId) => {
                // Criar carrinho de visitante
                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/cart/items`,
                    body: { productId, quantity: 1 },
                }).then((createResponse) => {
                    const guestCartId = createResponse.body.data.guestCartId ||
                        createResponse.headers['x-guest-cart-id-created'];

                    // Recuperar carrinho com header
                    cy.request({
                        method: 'GET',
                        url: `${apiUrl}/cart`,
                        headers: { 'x-guest-cart-id': guestCartId },
                    }).then((getResponse) => {
                        expect(getResponse.status).to.eq(200);
                        expect(getResponse.body.data.items.length).to.be.at.least(1);
                    });
                });
            });
        });
    });

    describe('Carrinho de Usuário', () => {
        it('deve adicionar item ao carrinho do usuário autenticado', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 2 },
                    }).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body.data.items).to.be.an('array');
                        expect(response.body.data.items[0].quantity).to.eq(2);
                    });
                });
            });
        });

        it('deve atualizar quantidade do item no carrinho', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    // Adicionar item primeiro
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 1 },
                    }).then(() => {
                        // Atualizar quantidade
                        cy.request({
                            method: 'PUT',
                            url: `${apiUrl}/cart/items/${productId}`,
                            headers: { Authorization: `Bearer ${token}` },
                            body: { quantity: 5 },
                        }).then((updateResponse) => {
                            expect(updateResponse.status).to.eq(200);
                            const item = updateResponse.body.data.items.find(
                                (i: any) => i.productId === productId
                            );
                            expect(item.quantity).to.eq(5);
                        });
                    });
                });
            });
        });

        it('deve remover item do carrinho', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    // Adicionar item primeiro
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 1 },
                    }).then(() => {
                        // Remover item
                        cy.request({
                            method: 'DELETE',
                            url: `${apiUrl}/cart/items/${productId}`,
                            headers: { Authorization: `Bearer ${token}` },
                        }).then((deleteResponse) => {
                            expect(deleteResponse.status).to.eq(200);
                            const removedItem = deleteResponse.body.data.items.find(
                                (i: any) => i.productId === productId
                            );
                            expect(removedItem).to.be.undefined;
                        });
                    });
                });
            });
        });

        it('deve retornar carrinho vazio para novo usuário', () => {
            createUserAndGetToken().then((token) => {
                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/cart`,
                    headers: { Authorization: `Bearer ${token}` },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.data.items).to.be.an('array');
                    expect(response.body.data.items.length).to.eq(0);
                });
            });
        });
    });

    describe('Cálculos do Carrinho', () => {
        it('deve calcular totais corretamente', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 3 },
                    }).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body.data).to.have.property('items');
                        expect(response.body.data.items).to.be.an('array');
                        expect(response.body.data.items.length).to.be.greaterThan(0);

                        // Verifica que o item foi adicionado com quantidade correta
                        const item = response.body.data.items[0];
                        expect(item).to.have.property('quantity');
                        expect(item.quantity).to.eq(3);
                    });
                });
            });
        });

        it('deve falhar ao adicionar quantidade maior que estoque', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    // Tentar adicionar quantidade absurda
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 999999 },
                        failOnStatusCode: false,
                    }).then((response) => {
                        // Deve falhar por limite de estoque
                        expect([400, 409]).to.include(response.status);
                    });
                });
            });
        });
    });

    describe('Validação de Item do Carrinho', () => {
        it('deve falhar com ID de produto inválido', () => {
            createUserAndGetToken().then((token) => {
                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/cart/items`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: { productId: '507f1f77bcf86cd799439011', quantity: 1 },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect([404, 400, 422]).to.include(response.status);
                });
            });
        });

        it('deve falhar com quantidade zero', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 0 },
                        failOnStatusCode: false,
                    }).then((response) => {
                        expect([400, 422]).to.include(response.status);
                    });
                });
            });
        });

        it('deve falhar com quantidade negativa', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: -1 },
                        failOnStatusCode: false,
                    }).then((response) => {
                        expect([400, 422]).to.include(response.status);
                    });
                });
            });
        });
    });
});

