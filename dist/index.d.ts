type Factory<T> = () => T;
type Token<T> = symbol & {
    __type?: T;
};
type Provider<T> = {
    kind: 'value';
    value: T;
} | {
    kind: 'singleton';
    factory: Factory<T>;
    instance?: T;
} | {
    kind: 'factory';
    factory: Factory<T>;
};
declare class Container {
    private parent?;
    private registry;
    constructor(parent?: Container | undefined);
    defineToken<T>(desc: string): Token<T>;
    registerValue<T>(token: Token<T>, value: T): void;
    registerSingleton<T>(token: Token<T>, factory: Factory<T>): void;
    registerFactory<T>(token: Token<T>, factory: Factory<T>): void;
    isRegistered<T>(token: Token<T>): boolean;
    resolve<T>(token: Token<T>): T;
    override<T>(token: Token<T>, provider: Provider<T>): void;
    reset(tokens?: Token<any>[]): undefined;
    createScope(): Container;
    overrideValue<T>(token: Token<T>, value: T): void;
    overrideSingleton<T>(token: Token<T>, factory: Factory<T>): void;
    overrideFactory<T>(token: Token<T>, factory: Factory<T>): void;
}
declare const rootContainer: Container;
declare const defineToken: <T>(desc: string) => Token<T>;
declare const registerValue: <T>(t: Token<T>, v: T) => void;
declare const registerSingleton: <T>(t: Token<T>, f: Factory<T>) => void;
declare const registerFactory: <T>(t: Token<T>, f: Factory<T>) => void;
declare const resolve: <T>(t: Token<T>) => T;
declare const isRegistered: <T>(t: Token<T>) => boolean;
declare const reset: (tokens?: Token<any>[]) => undefined;
declare const createScope: () => Container;
declare const overrideValue: <T>(t: Token<T>, v: T) => void;
declare const overrideSingleton: <T>(t: Token<T>, f: Factory<T>) => void;
declare const overrideFactory: <T>(t: Token<T>, f: Factory<T>) => void;

type IOCRegistrar = (c: Container) => void;
declare function registerIOCPlugin(registrar: IOCRegistrar): void;
/** Apenas leitura (sem expor o array interno) */
declare function getIOCPlugins(): IOCRegistrar[];
/** Para testes: limpar a lista de registrars */
declare function _clearIOCPlugins(): void;

/**
 * Executa todos os registrars previamente registrados (plugins de módulos).
 * Deve ser chamado uma única vez no início do app.
 */
declare function bootstrapIOC(): void;

export { Container, type IOCRegistrar, type Token, _clearIOCPlugins, bootstrapIOC, createScope, defineToken, getIOCPlugins, isRegistered, overrideFactory, overrideSingleton, overrideValue, registerFactory, registerIOCPlugin, registerSingleton, registerValue, reset, resolve, rootContainer };
