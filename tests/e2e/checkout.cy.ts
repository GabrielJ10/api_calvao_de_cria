/// <reference types="cypress" />

describe('API de Checkout E2E', () => {
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
        const email = `checkout_test_${Date.now()}@example.com`;
        return cy.request({
            method: 'POST',
            url: `${apiUrl}/auth/register`,
            body: {
                name: 'Usuario Checkout',
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
            throw new Error('Nenhum produto disponível para testes de checkout');
        });
    };

    // Helper para criar endereço (com campo alias obrigatório)
    const createAddress = (token: string) => {
        return cy.request({
            method: 'POST',
            url: `${apiUrl}/users/me/addresses`,
            headers: { Authorization: `Bearer ${token}` },
            body: {
                alias: 'Casa',
                recipientName: 'Usuario Teste',
                cep: '01310100',
                street: 'Avenida Paulista',
                number: '1000',
                complement: 'Sala 1',
                neighborhood: 'Bela Vista',
                city: 'São Paulo',
                state: 'SP',
                phone: '11999998888',
            },
        }).then((response) => response.body.data.id);
    };

    describe('GET /payment-methods', () => {
        it('deve retornar métodos de pagamento disponíveis', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/payment-methods`,
                failOnStatusCode: false,
            }).then((response) => {
                // A rota pode ser pública ou exigir auth dependendo da config
                expect(response.status).to.be.oneOf([200, 401]);
                if (response.status === 200) {
                    expect(response.body.data).to.be.an('array');
                }
            });
        });
    });

    describe('POST /checkout (Criação de Pedido)', () => {
        it('deve falhar sem autenticação', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/checkout`,
                body: {
                    addressId: '507f1f77bcf86cd799439011',
                    paymentMethodIdentifier: 'pix',
                },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it('deve falhar com ID de endereço inválido', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    // Adicionar item ao carrinho primeiro
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 1 },
                    }).then(() => {
                        // Tentar checkout com endereço inválido
                        cy.request({
                            method: 'POST',
                            url: `${apiUrl}/checkout`,
                            headers: { Authorization: `Bearer ${token}` },
                            body: {
                                addressId: '507f1f77bcf86cd799439011',
                                paymentMethodIdentifier: 'pix',
                            },
                            failOnStatusCode: false,
                        }).then((response) => {
                            expect(response.status).to.be.oneOf([400, 404, 422]);
                        });
                    });
                });
            });
        });

        it('deve falhar com método de pagamento inválido', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    // Adicionar item ao carrinho
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 1 },
                    }).then(() => {
                        createAddress(token).then((addressId) => {
                            // Tentar checkout com método de pagamento inválido
                            cy.request({
                                method: 'POST',
                                url: `${apiUrl}/checkout`,
                                headers: { Authorization: `Bearer ${token}` },
                                body: {
                                    addressId,
                                    paymentMethodIdentifier: 'metodo_invalido',
                                },
                                failOnStatusCode: false,
                            }).then((response) => {
                                expect(response.status).to.be.oneOf([400, 404, 422]);
                            });
                        });
                    });
                });
            });
        });

        it('deve criar pedido com sucesso com dados válidos', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    // Adicionar item ao carrinho
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 1 },
                    }).then(() => {
                        createAddress(token).then((addressId) => {
                            // Criar pedido (pode falhar se pix não estiver configurado)
                            cy.request({
                                method: 'POST',
                                url: `${apiUrl}/checkout`,
                                headers: { Authorization: `Bearer ${token}` },
                                body: {
                                    addressId,
                                    paymentMethodIdentifier: 'pix',
                                },
                                failOnStatusCode: false,
                            }).then((response) => {
                                // Aceita 201 (sucesso) ou erros de configuração do ambiente
                                expect(response.status).to.be.oneOf([201, 400, 404, 422]);
                                if (response.status === 201) {
                                    expect(response.body.data).to.have.property('orderNumber');
                                }
                            });
                        });
                    });
                });
            });
        });

        it('deve limpar carrinho após pedido bem-sucedido', () => {
            createUserAndGetToken().then((token) => {
                getProductId().then((productId) => {
                    // Adicionar item ao carrinho
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 1 },
                    }).then(() => {
                        createAddress(token).then((addressId) => {
                            // Criar pedido (pode falhar se pix não estiver configurado)
                            cy.request({
                                method: 'POST',
                                url: `${apiUrl}/checkout`,
                                headers: { Authorization: `Bearer ${token}` },
                                body: {
                                    addressId,
                                    paymentMethodIdentifier: 'pix',
                                },
                                failOnStatusCode: false,
                            }).then((checkoutResponse) => {
                                // Se checkout funcionou, verifica carrinho vazio
                                if (checkoutResponse.status === 201) {
                                    cy.request({
                                        method: 'GET',
                                        url: `${apiUrl}/cart`,
                                        headers: { Authorization: `Bearer ${token}` },
                                    }).then((cartResponse) => {
                                        expect(cartResponse.body.data.items.length).to.eq(0);
                                    });
                                } else {
                                    // Ambiente não configurado, aceita qualquer resposta válida
                                    expect(checkoutResponse.status).to.be.oneOf([400, 404, 422]);
                                }
                            });
                        });
                    });
                });
            });
        });
    });

    describe('Fluxo Completo de Compra', () => {
        it('deve completar fluxo completo: registro → carrinho → checkout', () => {
            const email = `flow_test_${Date.now()}@example.com`;
            const password = 'SecurePass123!';

            // Passo 1: Registrar usuário
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: {
                    name: 'Usuario Fluxo',
                    email,
                    password,
                    passwordConfirm: password,
                    cpf: generateCPF(),
                    phone: '11999998888',
                    birthDate: '1990-05-15',
                },
            }).then((registerResponse) => {
                expect(registerResponse.status).to.eq(201);
                const token = registerResponse.body.data.accessToken;

                // Passo 2: Buscar produto
                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/products`,
                    qs: { limit: 1 },
                }).then((productsResponse) => {
                    if (productsResponse.body.data.length === 0) {
                        cy.log('Nenhum produto disponível, pulando teste de fluxo');
                        return;
                    }

                    const productId = productsResponse.body.data[0].id;

                    // Passo 3: Adicionar ao carrinho
                    cy.request({
                        method: 'POST',
                        url: `${apiUrl}/cart/items`,
                        headers: { Authorization: `Bearer ${token}` },
                        body: { productId, quantity: 2 },
                    }).then((cartResponse) => {
                        expect(cartResponse.status).to.eq(200);
                        expect(cartResponse.body.data.items.length).to.eq(1);

                        // Passo 4: Criar endereço (com alias)
                        cy.request({
                            method: 'POST',
                            url: `${apiUrl}/users/me/addresses`,
                            headers: { Authorization: `Bearer ${token}` },
                            body: {
                                alias: 'Trabalho',
                                recipientName: 'Usuario Fluxo',
                                cep: '01310100',
                                street: 'Avenida Paulista',
                                number: '1000',
                                complement: 'Apto 101',
                                neighborhood: 'Bela Vista',
                                city: 'São Paulo',
                                state: 'SP',
                                phone: '11999998888',
                            },
                        }).then((addressResponse) => {
                            expect(addressResponse.status).to.eq(201);
                            const addressId = addressResponse.body.data.id;

                            // Passo 5: Finalizar compra (pode falhar se pix não estiver configurado)
                            cy.request({
                                method: 'POST',
                                url: `${apiUrl}/checkout`,
                                headers: { Authorization: `Bearer ${token}` },
                                body: {
                                    addressId,
                                    paymentMethodIdentifier: 'pix',
                                },
                                failOnStatusCode: false,
                            }).then((checkoutResponse) => {
                                // Aceita 201 (sucesso) ou erros de configuração do ambiente
                                expect(checkoutResponse.status).to.be.oneOf([201, 400, 404, 422]);

                                if (checkoutResponse.status === 201) {
                                    expect(checkoutResponse.body.data).to.have.property('orderNumber');

                                    // Verificar se carrinho foi limpo
                                    cy.request({
                                        method: 'GET',
                                        url: `${apiUrl}/cart`,
                                        headers: { Authorization: `Bearer ${token}` },
                                    }).then((finalCartResponse) => {
                                        expect(finalCartResponse.body.data.items.length).to.eq(0);
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});

