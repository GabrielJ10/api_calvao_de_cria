/// <reference types="cypress" />

describe('API de Autenticação E2E', () => {
    const apiUrl = '/api/v1';

    // Helper para gerar email único
    const uniqueEmail = () => `test_${Date.now()}@example.com`;

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

    describe('POST /auth/register', () => {
        it('deve registrar um novo usuário com sucesso', () => {
            const userData = {
                name: 'Usuario Teste',
                email: uniqueEmail(),
                password: 'SecurePass123!',
                passwordConfirm: 'SecurePass123!',
                cpf: generateCPF(),
                phone: '11999998888',
                birthDate: '1990-05-15',
            };

            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: userData,
            }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.data).to.have.property('accessToken');
                expect(response.body.data).to.have.property('refreshToken');
                expect(response.body.data.user).to.have.property('userId');
                expect(response.body.data.user.email).to.eq(userData.email);
            });
        });

        it('deve falhar com email duplicado', () => {
            const email = uniqueEmail();
            const userData = {
                name: 'Primeiro Usuario',
                email,
                password: 'SecurePass123!',
                passwordConfirm: 'SecurePass123!',
                cpf: generateCPF(),
                phone: '11999998888',
                birthDate: '1990-05-15',
            };

            // Primeiro registro
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: userData,
            });

            // Segundo registro com mesmo email
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: {
                    ...userData,
                    cpf: generateCPF(), // CPF diferente
                },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(422);
            });
        });

        it('deve falhar com campos obrigatórios ausentes', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: {
                    email: uniqueEmail(),
                    // Faltam outros campos obrigatórios
                },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(422);
                expect(response.body.status).to.eq('fail');
            });
        });

        it('deve falhar com CPF inválido', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: {
                    name: 'Usuario CPF Invalido',
                    email: uniqueEmail(),
                    password: 'SecurePass123!',
                    passwordConfirm: 'SecurePass123!',
                    cpf: '00000000000', // CPF inválido
                    phone: '11999998888',
                    birthDate: '1990-05-15',
                },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(422);
            });
        });

        it('deve falhar quando senhas não conferem', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: {
                    name: 'Usuario Senha Errada',
                    email: uniqueEmail(),
                    password: 'SecurePass123!',
                    passwordConfirm: 'DifferentPass456!',
                    cpf: generateCPF(),
                    phone: '11999998888',
                    birthDate: '1990-05-15',
                },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(422);
            });
        });
    });

    describe('POST /auth/login', () => {
        const testEmail = `login_test_${Date.now()}@example.com`;
        const testPassword = 'SecurePass123!';

        before(() => {
            // Registrar usuário para testes de login
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: {
                    name: 'Usuario Login',
                    email: testEmail,
                    password: testPassword,
                    passwordConfirm: testPassword,
                    cpf: generateCPF(),
                    phone: '11999998888',
                    birthDate: '1990-05-15',
                },
            });
        });

        it('deve fazer login com credenciais válidas', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/login`,
                body: {
                    email: testEmail,
                    password: testPassword,
                },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('accessToken');
                expect(response.body.data).to.have.property('refreshToken');
                expect(response.body.data.user.email).to.eq(testEmail);
            });
        });

        it('deve falhar com senha incorreta', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/login`,
                body: {
                    email: testEmail,
                    password: 'WrongPassword123!',
                },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body.message).to.include('inválid');
            });
        });

        it('deve falhar com email inexistente', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/login`,
                body: {
                    email: 'nonexistent@example.com',
                    password: 'AnyPassword123!',
                },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });
    });

    describe('POST /auth/refresh', () => {
        it('deve renovar access token com refresh token válido', () => {
            const email = uniqueEmail();
            const password = 'SecurePass123!';

            // Registrar e obter tokens
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: {
                    name: 'Usuario Refresh',
                    email,
                    password,
                    passwordConfirm: password,
                    cpf: generateCPF(),
                    phone: '11999998888',
                    birthDate: '1990-05-15',
                },
            }).then((registerResponse) => {
                const { refreshToken } = registerResponse.body.data;

                // Usar refresh token para obter novo access token
                cy.request({
                    method: 'POST',
                    url: `${apiUrl}/auth/refresh`,
                    body: { refreshToken },
                }).then((refreshResponse) => {
                    expect(refreshResponse.status).to.eq(200);
                    expect(refreshResponse.body.data).to.have.property('accessToken');
                });
            });
        });

        it('deve falhar com refresh token inválido', () => {
            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/refresh`,
                body: { refreshToken: 'invalid.token.here' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.be.oneOf([401, 422]);
            });
        });
    });

    describe('GET /users/me (Rota Protegida)', () => {
        it('deve retornar perfil do usuário com token válido', () => {
            const email = uniqueEmail();
            const password = 'SecurePass123!';

            cy.request({
                method: 'POST',
                url: `${apiUrl}/auth/register`,
                body: {
                    name: 'Usuario Perfil',
                    email,
                    password,
                    passwordConfirm: password,
                    cpf: generateCPF(),
                    phone: '11999998888',
                    birthDate: '1990-05-15',
                },
            }).then((registerResponse) => {
                const { accessToken } = registerResponse.body.data;

                cy.request({
                    method: 'GET',
                    url: `${apiUrl}/users/me`,
                    headers: { Authorization: `Bearer ${accessToken}` },
                }).then((profileResponse) => {
                    expect(profileResponse.status).to.eq(200);
                    expect(profileResponse.body.data.email).to.eq(email);
                });
            });
        });

        it('deve falhar sem header de autorização', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/users/me`,
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });

        it('deve falhar com token inválido', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/users/me`,
                headers: { Authorization: 'Bearer invalid.token.here' },
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(401);
            });
        });
    });
});

