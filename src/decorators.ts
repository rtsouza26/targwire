// src/decorators.ts
import { Container, Token, defineToken, rootContainer } from './container';

type Lifetime = 'singleton' | 'transient';

type InjectableOptions<T> = {
  token?: Token<T> | string;
  lifetime?: Lifetime;
  container?: Container;
};

// Guarded access to Reflect metadata so the lib works even without reflect-metadata.
type ReflectWithMetadata = typeof Reflect & { getMetadata?: (key: string, target: object) => any };
const ReflectMeta = Reflect as ReflectWithMetadata;

// Internal store for constructor parameter tokens provided via @Inject.
const paramTokens = new WeakMap<Function, (Token<any> | undefined)[]>();

/**
 * Marca um parâmetro do construtor para ser resolvido a partir de um Token.
 * Use quando o tipo não pode ser deduzido ou para customizar o Token.
 */
export function Inject(tokenOrDesc: Token<any> | string): ParameterDecorator {
  return (target, _propertyKey, index) => {
    const existing = paramTokens.get(target as unknown as Function) ?? [];
    const token =
      typeof tokenOrDesc === 'string'
        ? defineToken(tokenOrDesc)
        : tokenOrDesc;
    existing[index] = token;
    paramTokens.set(target as unknown as Function, existing);
  };
}

/**
 * Resolve os Tokens dos parâmetros do construtor usando:
 * 1) @Inject declarado explicitamente
 * 2) design:paramtypes (se reflect-metadata estiver carregado)
 */
function getConstructorTokens(target: Function): Token<any>[] {
  const explicit = paramTokens.get(target) ?? [];
  const designTypes = ReflectMeta.getMetadata?.('design:paramtypes', target) as any[] | undefined;
  const inferred = designTypes ?? [];

  const max = Math.max(explicit.length, inferred.length);
  const tokens: Token<any>[] = [];

  for (let i = 0; i < max; i++) {
    const provided = explicit[i];
    if (provided) {
      tokens.push(provided);
      continue;
    }
    const type = inferred[i];
    if (type && type.name && type.name !== 'Object') {
      tokens.push(defineToken(type.name));
      continue;
    }
    throw new Error(`Token ausente para o parâmetro ${i} do construtor de ${target.name}. Adicione @Inject().`);
  }

  return tokens;
}

/**
 * Registra a classe no container e monta as dependências via construtor.
 *
 * - Por padrão registra como singleton no rootContainer.
 * - Se lifetime === 'transient', registra como factory.
 * - O token padrão é o nome da classe, mas pode ser passado via options.token.
 */
export function Injectable<T>(options: InjectableOptions<T> = {}): ClassDecorator {
  return (ctor: any) => {
    const container = options.container ?? rootContainer;
    const token =
      typeof options.token === 'string'
        ? defineToken<T>(options.token)
        : options.token ?? defineToken<T>(ctor.name);
    const deps = getConstructorTokens(ctor);
    const factory = () => new ctor(...deps.map((t) => container.resolve(t)));

    if (options.lifetime === 'transient') {
      container.registerFactory(token, factory);
    } else {
      container.registerSingleton(token, factory);
    }
  };
}

/**
 * Injeta uma dependência em um campo usando o rootContainer.
 * Útil para cenários React/Expo em que não queremos mudar o construtor.
 */
export function Resolve(tokenOrDesc?: Token<any> | string): PropertyDecorator {
  return (target, propertyKey) => {
    const token =
      tokenOrDesc === undefined
        ? defineToken(String(propertyKey))
        : typeof tokenOrDesc === 'string'
          ? defineToken(tokenOrDesc)
          : tokenOrDesc;

    Object.defineProperty(target, propertyKey, {
      get() {
        return rootContainer.resolve(token);
      },
      enumerable: true,
      configurable: true,
    });
  };
}
