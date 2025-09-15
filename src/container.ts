// src/container.ts
type Factory<T> = () => T;
export type Token<T> = symbol & { __type?: T };

type Provider<T> =
  | { kind: 'value'; value: T }
  | { kind: 'singleton'; factory: Factory<T>; instance?: T }
  | { kind: 'factory'; factory: Factory<T> };

export class Container {
  private registry = new Map<Token<any>, Provider<any>>();
  constructor(private parent?: Container) {}

  defineToken<T>(desc: string): Token<T> {
    return Symbol.for(`ioc:${desc}`) as Token<T>;
  }

  registerValue<T>(token: Token<T>, value: T) {
    this.registry.set(token, { kind: 'value', value });
  }
  registerSingleton<T>(token: Token<T>, factory: Factory<T>) {
    this.registry.set(token, { kind: 'singleton', factory });
  }
  registerFactory<T>(token: Token<T>, factory: Factory<T>) {
    this.registry.set(token, { kind: 'factory', factory });
  }

  isRegistered<T>(token: Token<T>): boolean {
    return this.registry.has(token) || (!!this.parent && this.parent.isRegistered(token));
  }

  resolve<T>(token: Token<T>): T {
    if (this.registry.has(token)) {
      const prov = this.registry.get(token)!;
      switch (prov.kind) {
        case 'value': return prov.value as T;
        case 'singleton':
          if (prov.instance === undefined) prov.instance = prov.factory();
          return prov.instance as T;
        case 'factory': return prov.factory();
      }
    }
    if (this.parent) return this.parent.resolve(token);
    throw new Error(`Token not registered: ${String(token)}`);
  }

  override<T>(token: Token<T>, provider: Provider<T>) {
    this.registry.set(token, provider);
  }

  reset(tokens?: Token<any>[]) {
    if (!tokens) return void this.registry.clear();
    for (const t of tokens) this.registry.delete(t);
  }

  createScope(): Container {
    return new Container(this);
  }

  overrideValue<T>(token: Token<T>, value: T) { this.override(token, { kind: 'value', value }); }
  overrideSingleton<T>(token: Token<T>, factory: Factory<T>) { this.override(token, { kind: 'singleton', factory }); }
  overrideFactory<T>(token: Token<T>, factory: Factory<T>) { this.override(token, { kind: 'factory', factory }); }
}

// Root container + helpers
export const rootContainer = new Container();
export const defineToken = <T>(desc: string) => rootContainer.defineToken<T>(desc);
export const registerValue = <T>(t: Token<T>, v: T) => rootContainer.registerValue(t, v);
export const registerSingleton = <T>(t: Token<T>, f: Factory<T>) => rootContainer.registerSingleton(t, f);
export const registerFactory = <T>(t: Token<T>, f: Factory<T>) => rootContainer.registerFactory(t, f);
export const resolve = <T>(t: Token<T>) => rootContainer.resolve<T>(t);
export const isRegistered = <T>(t: Token<T>) => rootContainer.isRegistered<T>(t);
export const reset = (tokens?: Token<any>[]) => rootContainer.reset(tokens);
export const createScope = () => rootContainer.createScope();
export const overrideValue = <T>(t: Token<T>, v: T) => rootContainer.overrideValue(t, v);
export const overrideSingleton = <T>(t: Token<T>, f: Factory<T>) => rootContainer.overrideSingleton(t, f);
export const overrideFactory = <T>(t: Token<T>, f: Factory<T>) => rootContainer.overrideFactory(t, f);
