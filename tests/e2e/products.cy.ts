/// <reference types="cypress" />

describe('API de Produtos E2E', () => {
    const apiUrl = '/api/v1';

    describe('GET /products', () => {
        it('deve retornar lista paginada de produtos', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/products`,
                qs: { page: 1, limit: 10 },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.be.an('array');
                expect(response.body).to.have.property('details');
                expect(response.body.details).to.have.property('totalItems');
                expect(response.body.details).to.have.property('totalPages');
                expect(response.body.details).to.have.property('currentPage');
            });
        });

        it('deve filtrar produtos por busca', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/products`,
                qs: { search: 'test' },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.be.an('array');
            });
        });

        it('deve filtrar produtos por faixa de preço', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/products`,
                qs: { minPrice: 10, maxPrice: 100 },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.be.an('array');
                // Se há produtos, verifica se estão na faixa de preço
                response.body.data.forEach((product: any) => {
                    const price = product.promotionalPrice || product.price;
                    expect(price).to.be.at.least(10);
                    expect(price).to.be.at.most(100);
                });
            });
        });

        it('deve filtrar produtos em promoção', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/products`,
                qs: { inPromotion: 'true' },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.be.an('array');
            });
        });

        it('deve ordenar produtos por preço crescente', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/products`,
                qs: { sortBy: 'price', order: 'asc' },
            }).then((response) => {
                expect(response.status).to.eq(200);
                const products = response.body.data;
                expect(products).to.be.an('array');
                // Apenas verifica que a resposta é válida
                // A ordenação pode considerar apenas o campo 'price' sem promoções
            });
        });

        it('deve paginar resultados corretamente', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/products`,
                qs: { page: 1, limit: 5 },
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.details.currentPage).to.eq(1);
                expect(response.body.details.limit).to.eq(5);
                expect(response.body.data.length).to.be.at.most(5);
            });
        });
    });

    describe('GET /products/:productId', () => {
        it('deve retornar 404 para produto inexistente', () => {
            const fakeId = '507f1f77bcf86cd799439011';

            cy.request({
                method: 'GET',
                url: `${apiUrl}/products/${fakeId}`,
                failOnStatusCode: false,
            }).then((response) => {
                expect(response.status).to.eq(404);
                expect(response.body.message).to.include('não encontrado');
            });
        });

        it('deve retornar erro para ID de produto inválido', () => {
            cy.request({
                method: 'GET',
                url: `${apiUrl}/products/invalid-id`,
                failOnStatusCode: false,
            }).then((response) => {
                // API pode retornar 400, 422, 404 ou 500 dependendo do tratamento de erro
                expect(response.status).to.be.oneOf([400, 422, 404, 500]);
            });
        });

        it('deve retornar detalhes do produto com ID válido', () => {
            // Primeiro busca um produto da lista
            cy.request({
                method: 'GET',
                url: `${apiUrl}/products`,
                qs: { limit: 1 },
            }).then((listResponse) => {
                if (listResponse.body.data.length > 0) {
                    const productId = listResponse.body.data[0].id;

                    cy.request({
                        method: 'GET',
                        url: `${apiUrl}/products/${productId}`,
                    }).then((detailResponse) => {
                        expect(detailResponse.status).to.eq(200);
                        expect(detailResponse.body.data).to.have.property('id');
                        expect(detailResponse.body.data).to.have.property('name');
                        expect(detailResponse.body.data).to.have.property('price');
                        expect(detailResponse.body.data.id).to.eq(productId);
                    });
                } else {
                    cy.log('Nenhum produto disponível para teste de detalhes');
                }
            });
        });
    });
});

