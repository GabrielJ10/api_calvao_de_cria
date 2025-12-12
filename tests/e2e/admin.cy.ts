/// <reference types="cypress" />

describe('API de Administração E2E', () => {
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

    // Helper para criar usuário comum (cliente)
    const createCustomerAndGetToken = () => {
        const email = `customer_${Date.now()}@example.com`;
        return cy.request({
            method: 'POST',
            url: `${apiUrl}/auth/register`,
            body: {
                name: 'Usuario Cliente',
                email,
                password: 'SecurePass123!',
                passwordConfirm: 'SecurePass123!',
                cpf: generateCPF(),
                phone: '11999998888',
                birthDate: '1990-05-15',
            },
        }).then((response) => response.body.data.accessToken);
    };

    // Helper para fazer login como admin (assume que o admin existe no banco)
    const loginAsAdmin = () => {
        const adminEmail = Cypress.env('ADMIN_EMAIL') || 'admin@admin.com';
        const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'admin123';

        return cy.request({
            method: 'POST',
            url: `${apiUrl}/auth/login`,
            body: { email: adminEmail, password: adminPassword },
            failOnStatusCode: false,
        }).then((response) => {
            if (response.status === 200) {
                return response.body.data.accessToken;
            }
            // Se admin não existe, pular testes de admin
            return null;
        });
    };

    describe('Controle de Acesso (RBAC)', () => {
        it('deve negar acesso às rotas admin sem autenticação', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/admin/products`,
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it('deve negar acesso às rotas admin para clientes comuns', () => {
            createCustomerAndGetToken().then((token) => {
                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/admin/products`,
                    headers: { Authorization: `Bearer ${token}` },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body.message).to.include('permissão');
                });
            });
        });

        it('deve permitir acesso às rotas admin para administradores', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/admin/products`,
                    headers: { Authorization: `Bearer ${token}` },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.data).to.be.an('array');
                });
            });
        });
    });

    describe('CRUD de Produtos (Admin)', () => {
        it('deve listar produtos para admin', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/admin/products`,
                    headers: { Authorization: `Bearer ${token}` },
                    qs: { page: 1, limit: 10 },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.data).to.be.an('array');
                    expect(response.body).to.have.property('details');
                });
            });
        });

        it('deve criar um novo produto', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                const productData = {
                    name: `Produto E2E Test ${Date.now()}`,
                    description: 'Produto criado pelo teste E2E',
                    price: 99.99,
                    stockQuantity: 50,
                    isActive: true,
                };

                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/admin/products`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: productData,
                }).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body.data).to.have.property('id');
                    expect(response.body.data.name).to.eq(productData.name);
                    expect(response.body.data.price).to.eq(productData.price);
                });
            });
        });

        it('deve atualizar um produto', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                // Primeiro criar um produto
                const initialData = {
                    name: `Produto Update Test ${Date.now()}`,
                    description: 'Descrição inicial',
                    price: 50.00,
                    stockQuantity: 10,
                    isActive: true,
                };

                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/admin/products`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: initialData,
                }).then((createResponse) => {
                    const productId = createResponse.body.data.id;

                    // Atualizar o produto
                    cy.request({
                        method: 'PUT',
                        url: `${apiUrl}/admin/products/${productId}`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: {
                            name: 'Nome Atualizado',
                            price: 75.00,
                        },
                    }).then((updateResponse) => {
                        expect(updateResponse.status).to.eq(200);
                        expect(updateResponse.body.data.name).to.eq('Nome Atualizado');
                        expect(updateResponse.body.data.price).to.eq(75.00);
                    });
                });
            });
        });

        it('deve deletar um produto', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                // Primeiro criar um produto
                const productData = {
                    name: `Produto Delete Test ${Date.now()}`,
                    description: 'Produto para ser deletado',
                    price: 25.00,
                    stockQuantity: 5,
                    isActive: true,
                };

                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/admin/products`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: productData,
                }).then((createResponse) => {
                    const productId = createResponse.body.data.id;

                    // Deletar o produto
                    cy.request({
                        method: 'DELETE',
                        url: `${apiUrl}/admin/products/${productId}`,
                        headers: { Authorization: `Bearer ${token}` },
                    }).then((deleteResponse) => {
                        expect(deleteResponse.status).to.eq(204);

                        // Verificar se produto foi deletado
                        cy.request({
                            method: 'GET',
                            url: `${apiUrl}/products/${productId}`,
                            failOnStatusCode: false,
                        }).then((getResponse) => {
                            expect(getResponse.status).to.eq(404);
                        });
                    });
                });
            });
        });

        it('deve falhar ao criar produto sem campos obrigatórios', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/admin/products`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: {
                        // Faltam name, price, etc.
                        description: 'Produto incompleto',
                    },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect([400, 422]).to.include(response.status);
                });
            });
        });

        it('deve falhar ao criar produto com preço negativo', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/admin/products`,
                    headers: { Authorization: `Bearer ${token}` },
                    body: {
                        name: 'Produto Preço Negativo',
                        price: -10.00,
                        stockQuantity: 10,
                    },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect([400, 422]).to.include(response.status);
                });
            });
        });
    });

    describe('Pedidos (Admin)', () => {
        it('deve listar pedidos para admin', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/admin/orders`,
                    headers: { Authorization: `Bearer ${token}` },
                    qs: { page: 1, limit: 10 },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.data).to.be.an('array');
                });
            });
        });

        it('deve negar listagem de pedidos para clientes comuns', () => {
            createCustomerAndGetToken().then((token) => {
                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/admin/orders`,
                    headers: { Authorization: `Bearer ${token}` },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.eq(403);
                });
            });
        });
    });

    describe('Usuários (Admin)', () => {
        it('deve listar usuários para admin', () => {
            loginAsAdmin().then((token) => {
                if (!token) {
                    cy.log('Usuário admin não disponível, pulando teste');
                    return;
                }

                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/admin/users`,
                    headers: { Authorization: `Bearer ${token}` },
                    qs: { page: 1, limit: 10 },
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.data).to.be.an('array');
                });
            });
        });

        it('deve negar listagem de usuários para clientes comuns', () => {
            createCustomerAndGetToken().then((token) => {
                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/admin/users`,
                    headers: { Authorization: `Bearer ${token}` },
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.status).to.eq(403);
                });
            });
        });
    });
});

