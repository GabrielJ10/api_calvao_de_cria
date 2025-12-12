### 🏗️ Fase 1: Refatoração Arquitetural (Desacoplamento)

_O objetivo aqui é parar de usar instâncias globais (`new Controller`) e passar a usar Injeção de Dependência manual._

#### 1.1. Liberar as Classes (Controllers, Services, Repositories)

Atualmente, seus arquivos exportam a instância já criada (`export default new X()`).

- [ ] **Ação:** Em todos os arquivos de `src/controllers/`, `src/services/` e `src/repositories/`:
  - Mantenha a `export class NomeDaClasse`.
  - Remova ou altere o `export default new ...` para exportar apenas a instância padrão (opcional) ou mova a instanciação para um arquivo central.
- **Exemplo (`src/controllers/checkout.controller.ts`):**
  ```typescript
  export class CheckoutController { constructor(private service: ICheckoutService) {} ... }
  // Remova: export default new CheckoutController(...)
  ```

#### 1.2. Refatorar as Rotas para Factories

As rotas atuais importam os controllers diretamente. Elas precisam _receber_ os controllers.

- [ ] **Ação:** Transforme arquivos como `src/routes/checkout.routes.ts` em funções.
  ```typescript
  export const createCheckoutRoutes = (controller: CheckoutController) => {
    const router = Router();
    router.post('/checkout', controller.createOrder);
    return router;
  };
  ```

#### 1.3. Criar a "Composition Root" (App Factory)

Você precisa de um lugar para montar o aplicativo com as peças reais (para produção) ou peças falsas (para testes).

- [ ] **Ação:** Refatore `src/app.ts` para exportar uma função `createApp`.

  ```typescript
  interface AppDependencies {
    checkoutController: CheckoutController;
    // ... outros controllers
  }

  export const createApp = (deps: AppDependencies) => {
    const app = express();
    // ... middlewares globais
    app.use('/api/v1/checkout', createCheckoutRoutes(deps.checkoutController));
    return app;
  };
  ```

- [ ] **Ação:** Atualize `src/server.ts` para instanciar tudo (o "Mundo Real").
  ```typescript
  // server.ts
  const repo = new CheckoutRepository();
  const service = new CheckoutService(repo);
  const controller = new CheckoutController(service);
  const app = createApp({ checkoutController: controller });
  app.listen(3000...);
  ```

---

### 🧪 Fase 2: Implementação dos Testes Top-Down

_Agora que o código permite, vamos criar os testes em camadas._

#### 2.1. Nível 1: Testes de Controller (A Casca)

_Objetivo: Validar HTTP, Rotas e Middlewares sem lógica de negócio._

- [ ] **Criar:** `tests/integration/top-down/01-controller/checkout.controller.spec.ts`.
- [ ] **Setup:**
  1.  Crie um **Mock do Service** (`const mockService = { createOrder: vi.fn() }`).
  2.  Instancie o Controller com esse mock: `const controller = new CheckoutController(mockService)`.
  3.  Monte o app: `const app = createApp({ checkoutController: controller })`.
- [ ] **Testar:**
  - Faça chamadas `supertest(app)`.
  - Verifique se o mock do serviço foi chamado com os argumentos certos.
  - Verifique se o Controller respondeu com o Status Code correto (200, 400, 500) baseado no retorno do mock.

#### 2.2. Nível 2: Testes de Fluxo de Negócio (O Coração Top-Down)

_Objetivo: Validar a integração Controller + Service (Regra de Negócio Real) sem Banco de Dados._

- [ ] **Criar:** `tests/integration/top-down/02-business-flow/checkout.flow.spec.ts`.
- [ ] **Setup:**
  1.  Crie um **Mock do Repositório** (`const mockRepo = { createOrder: vi.fn(), ... }`).
  2.  Instancie o Service **REAL** injetando o mock do repositório: `const service = new CheckoutService(mockRepo)`.
  3.  Instancie o Controller **REAL** injetando o serviço real.
  4.  Monte o app com esse controller híbrido.
- [ ] **Testar:**
  - Envie um payload de checkout.
  - Valide se a lógica do serviço (ex: cálculo de totais, validação de estoque) funcionou.
  - Valide se o `mockRepo.createOrder` foi chamado com os dados já processados corretamente.

#### 2.3. Nível 3: Testes de Persistência (A Base)

_Objetivo: Garantir que o Repositório conversa com o Mongo corretamente._

- [ ] **Criar:** `tests/integration/top-down/03-database/order.repository.spec.ts`.
- [ ] **Setup:** Conecte ao `MongoMemoryServer` (você já tem isso no `setup.ts`).
- [ ] **Testar:**
  - Instancie o Repositório Real.
  - Chame métodos como `createOrderTransactional`.
  - Verifique se o dado foi salvo no banco e se pode ser consultado.

---

### 🧹 Fase 3: Limpeza e Manutenção

- [ ] **Renomear Testes Antigos:** Mova seus testes atuais de `tests/integration` para `tests/e2e` ou `tests/system`. Eles continuam valiosos como "Smoke Tests" (teste de fumaça) para garantir que tudo funciona junto.
- [ ] **Atualizar Pipeline:** Garanta que o GitHub Actions rode todas as novas pastas de teste.

### 🏆 Critérios de Sucesso (Definition of Done)
