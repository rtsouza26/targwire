# Expo + TargWire + Decorators + Zustand + React Query

Exemplo mínimo de como estruturar um app **Expo** usando os decorators do TargWire, **Zustand** para estado de UI e **React Query** para consumo de API. Copie os arquivos abaixo para dentro de um projeto criado com `npx create-expo-app`.

## Dependências

```bash
npm i targwire reflect-metadata zustand @tanstack/react-query
npm i -D @babel/plugin-proposal-decorators babel-plugin-transform-typescript-metadata
```

### Estrutura sugerida

```
examples/expo-zustand-react-query/
  App.tsx
  src/
    hooks/useUsersQuery.ts
    ioc/bootstrap.ts
    ioc/plugins.ts
    ioc/tokens.ts
    screens/UsersScreen.tsx
    services/user_api.ts
    services/user_repository.ts
    state/userFilterStore.ts
```

Importe `App.tsx` como entrypoint do Expo (ou adapte para o `app` router). Os decorators registram automaticamente as classes no container quando os módulos são importados.

## Fluxo rápido

- `src/ioc/tokens.ts`: tokens tipados (`TOKENS.UserApi` e `TOKENS.UserRepository`).
- `src/services/user_api.ts`: `@Injectable` singleton que busca usuários da API JSONPlaceholder.
- `src/services/user_repository.ts`: `@Injectable` que usa `@Inject(TOKENS.UserApi)` e expõe `list()`.
- `src/ioc/plugins.ts`: importa os serviços para executar os decorators antes do `bootstrapIOC()`.
- `src/hooks/useUsersQuery.ts`: hook que resolve o repositório via IoC e usa **React Query**.
- `src/state/userFilterStore.ts`: store **Zustand** para filtro de texto.
- `src/screens/UsersScreen.tsx`: tela que combina React Query + Zustand.
- `App.tsx`: configura `QueryClientProvider`, importa os plugins e roda `bootstrapIOC()`.

## Configuração do Babel (decorators)

Crie `babel.config.js` na raiz do app Expo:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      'babel-plugin-transform-typescript-metadata',
    ],
  };
};
```

## tsconfig.json (decorators + metadata)

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "target": "ES2019",
    "module": "ESNext",
    "declaration": true,
    "isolatedModules": true,
    "moduleResolution": "Bundler",
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## App.tsx

```tsx
import 'reflect-metadata';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrapIOC } from 'targwire';
import './src/ioc/plugins';
import UsersScreen from './src/screens/UsersScreen';

bootstrapIOC();

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UsersScreen />
    </QueryClientProvider>
  );
}
```

## Tela de exemplo

`UsersScreen` resolve o repositório via hook, consulta com React Query e filtra com Zustand:

```tsx
// src/screens/UsersScreen.tsx (trecho)
const { data, isLoading, isError, refetch } = useUsersQuery();
const search = useUserFilterStore((s) => s.search);
const filtered = useMemo(() => {
  if (!data) return [];
  const term = search.trim().toLowerCase();
  if (!term) return data;
  return data.filter(
    (u) =>
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term),
  );
}, [data, search]);
```

Para trocar a API, altere `src/services/user_api.ts` e mantenha as dependências isoladas no repositório. Tokens e override continuam funcionais em testes.
