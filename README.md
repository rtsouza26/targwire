# TargWire

Mini **IoC container** tipado para TypeScript com **Singleton**, **Transient (Factory)** e **Scoped** (child containers). Ideal para apps **Expo/React Native** (Hermes), web e Node — zero dependências.

- ✅ Tokens tipados (`Token<T>`)
- ✅ Ciclos de vida: `registerSingleton`, `registerFactory` (transient), `createScope` (scoped)
- ✅ Overrides e reset (testes/HMR)
- ✅ Plugin registry para registrar módulos do **app** e dar `bootstrapIOC()` uma vez só

---

## Instalação

```bash
npm i targwire
# ou
yarn add targwire
# ou
pnpm add targwire
```

> O pacote já é publicado transpilado (ESM + CJS) com typings. Não precisa configurar Metro/Babel pra transpilar TS em `node_modules`.

---

## TL;DR (Exemplo rápido)

**1) Defina tokens do domínio (no app):**
```ts
// src/ioc/tokens.users.ts
import { defineToken } from 'targwire';
import type { GetUsersUseCase } from '@/domain/usecases/get_users_usecase';
import type { UserRepository } from '@/domain/repositories/user_repository';
import type { UserRemoteDataSource } from '@/data/datasources/remote/user_remote_data_source';

export const TOKENS_USERS = {
  RemoteDataSource: defineToken<UserRemoteDataSource>('Users.RemoteDataSource'),
  Repository:       defineToken<UserRepository>('Users.Repository'),
  GetUsersUseCase:  defineToken<GetUsersUseCase>('Users.GetUsersUseCase'),
};
```

**2) Registre seu módulo via plugin (no app):**
```ts
// src/ioc/plugins.ts  (side-effect)
import { registerIOCPlugin } from 'targwire';
import { TOKENS_USERS } from './tokens.users';
import { UserRemoteDataSourceImpl } from '@/data/datasources/remote/user_remote_data_source';
import { UserRepositoryImpl } from '@/data/repositories/user_repository_impl';
import { GetUsersUseCase } from '@/domain/usecases/get_users_usecase';

registerIOCPlugin((c) => {
  if (!c.isRegistered(TOKENS_USERS.RemoteDataSource))
    c.registerSingleton(TOKENS_USERS.RemoteDataSource, () => new UserRemoteDataSourceImpl());
  if (!c.isRegistered(TOKENS_USERS.Repository))
    c.registerSingleton(TOKENS_USERS.Repository, () =>
      new UserRepositoryImpl(c.resolve(TOKENS_USERS.RemoteDataSource))
    );
  if (!c.isRegistered(TOKENS_USERS.GetUsersUseCase))
    c.registerFactory(TOKENS_USERS.GetUsersUseCase, () =>
      new GetUsersUseCase(c.resolve(TOKENS_USERS.Repository))
    );
});
```

**3) Bootstrap uma vez no entrypoint do app:**
```tsx
// App.tsx
import React from 'react';
import '@/ioc/plugins';                 // importa teus módulos (efeito colateral)
import { bootstrapIOC } from 'targwire';

bootstrapIOC();

export default function App() {
  return null; // sua navegação/telas aqui
}
```

**4) Consumir onde precisar:**
```ts
import { resolve } from 'targwire';
import { TOKENS_USERS } from '@/ioc/tokens.users';

const getUsers = resolve(TOKENS_USERS.GetUsersUseCase); // transient
const users = await getUsers.execute();
```

---

## API da biblioteca

```ts
// Container raiz pronto:
import {
  rootContainer,
  defineToken,             // <T>(name: string) => Token<T>
  registerValue,           // (token, value)
  registerSingleton,       // (token, () => T)  // lazy
  registerFactory,         // (token, () => T)  // transient
  resolve,                 // (token) => T
  isRegistered,            // (token) => boolean
  reset,                   // (tokens?) => void
  createScope,             // () => Container   // scoped child
  overrideValue,
  overrideSingleton,
  overrideFactory,
  // Plugins/Bootstrap
  registerIOCPlugin,       // (registrar: (c: Container) => void)
  bootstrapIOC,            // executa todos os registrars uma vez
} from 'targwire';
```

### Ciclos de vida
- **Singleton**: `registerSingleton(T, factory)`. A instância é criada no primeiro `resolve(T)` e reaproveitada naquele container/escopo.
- **Transient**: `registerFactory(T, factory)`. Uma **nova** instância a cada `resolve(T)`.
- **Scoped**: `const scope = rootContainer.createScope()`. Registros no escopo ficam isolados; `resolve` procura no escopo e sobe pro pai se necessário.

---

## Padrão de plugins (módulos do app)

A lib **não** conhece teus domínios. Em vez de importar registradores manualmente no `App.tsx`, basta centralizar tudo num arquivo `src/ioc/plugins.ts`:

```ts
// src/ioc/plugins.ts
import { registerIOCPlugin } from 'targwire';
import { TOKENS_USERS } from './tokens.users';
// ...imports do módulo

registerIOCPlugin((c) => {
  // registros do módulo Users
});

// registerIOCPlugin(...); // Auth
// registerIOCPlugin(...); // Products
```

Depois, no `App.tsx`:
```ts
import '@/ioc/plugins';
import { bootstrapIOC } from 'targwire';
bootstrapIOC();
```

> Quer reduzir a 1 import só? Crie `src/ioc/bootstrap-app.ts` com:
> ```ts
> import '@/ioc/plugins';
> export { bootstrapIOC as default } from 'targwire';
> ```
> E no `App.tsx`:
> ```ts
> import bootstrapIOC from '@/ioc/bootstrap-app';
> bootstrapIOC();
> ```

---

## Exemplos

### Singleton
```ts
registerSingleton(TOKENS_USERS.Repository, () =>
  new UserRepositoryImpl(resolve(TOKENS_USERS.RemoteDataSource))
);
const a = resolve(TOKENS_USERS.Repository);
const b = resolve(TOKENS_USERS.Repository);
console.log(a === b); // true
```

### Transient
```ts
registerFactory(TOKENS_USERS.GetUsersUseCase, () =>
  new GetUsersUseCase(resolve(TOKENS_USERS.Repository))
);
const x = resolve(TOKENS_USERS.GetUsersUseCase);
const y = resolve(TOKENS_USERS.GetUsersUseCase);
console.log(x === y); // false
```

### Scoped por tela (React Native)
```tsx
import React, { useMemo } from 'react';
import { rootContainer } from 'targwire';
import { TOKENS_USERS } from '@/ioc/tokens.users';
import { UserRemoteDataSourceImpl } from '@/data/datasources/remote/user_remote_data_source';
import { UserRepositoryImpl } from '@/data/repositories/user_repository_impl';
import { GetUsersUseCase } from '@/domain/usecases/get_users_usecase';

export default function UsersScreenScoped() {
  const scope = useMemo(() => {
    const s = rootContainer.createScope();
    s.registerSingleton(TOKENS_USERS.RemoteDataSource, () => new UserRemoteDataSourceImpl());
    s.registerSingleton(TOKENS_USERS.Repository, () =>
      new UserRepositoryImpl(s.resolve(TOKENS_USERS.RemoteDataSource))
    );
    s.registerFactory(TOKENS_USERS.GetUsersUseCase, () =>
      new GetUsersUseCase(s.resolve(TOKENS_USERS.Repository))
    );
    return s;
  }, []);

  // use s.resolve(...) aqui
  return null;
}
```

---

## Testes e overrides

```ts
import { reset, bootstrapIOC, overrideValue, resolve } from 'targwire';
import { TOKENS_USERS } from '@/ioc/tokens.users';
import '@/ioc/plugins';

beforeEach(() => {
  reset();        // limpa o root container
  bootstrapIOC(); // re-registra os plugins
});

test('override de use case', async () => {
  overrideValue(TOKENS_USERS.GetUsersUseCase, {
    execute: async () => [{ id: '1', name: 'Ana' } as any],
  } as any);

  const uc = resolve(TOKENS_USERS.GetUsersUseCase);
  const users = await uc.execute();
  expect(users[0].name).toBe('Ana');
});
```

---

## Dicas & Troubleshooting

- **`bootstrapIOC is not a function`**  
  Verifique **export/import** (nomeado vs default) **e** a ordem dos imports:
  - Importar `@/ioc/plugins` **antes** de `bootstrapIOC()`.
  - Use um só estilo:
    ```ts
    import { bootstrapIOC } from 'targwire'; // export nomeado
    ```
- **Tokens repetidos em HMR/Metro**  
  Use `Symbol.for('ioc:...')` (já fazemos) e, se necessário, `reset()` durante dev.
- **Alias `@`**  
  Configure o alias no Babel/Metro **do app**. A lib não precisa.

---

## Requisitos de runtime

- TypeScript 5+
- Target ES2019+ (ok para Hermes / RN 0.7x+)
- Sem dependências nativas

---

## Licença

MIT © Rafael Targino
