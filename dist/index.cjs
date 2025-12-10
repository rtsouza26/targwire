"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Container: () => Container,
  Inject: () => Inject,
  Injectable: () => Injectable,
  Resolve: () => Resolve,
  _clearIOCPlugins: () => _clearIOCPlugins,
  bootstrapIOC: () => bootstrapIOC,
  createScope: () => createScope,
  defineToken: () => defineToken,
  getIOCPlugins: () => getIOCPlugins,
  isRegistered: () => isRegistered,
  overrideFactory: () => overrideFactory,
  overrideSingleton: () => overrideSingleton,
  overrideValue: () => overrideValue,
  registerFactory: () => registerFactory,
  registerIOCPlugin: () => registerIOCPlugin,
  registerSingleton: () => registerSingleton,
  registerValue: () => registerValue,
  reset: () => reset,
  resolve: () => resolve,
  rootContainer: () => rootContainer
});
module.exports = __toCommonJS(index_exports);

// src/container.ts
var Container = class _Container {
  constructor(parent) {
    this.parent = parent;
    this.registry = /* @__PURE__ */ new Map();
  }
  defineToken(desc) {
    return Symbol.for(`ioc:${desc}`);
  }
  registerValue(token, value) {
    this.registry.set(token, { kind: "value", value });
  }
  registerSingleton(token, factory) {
    this.registry.set(token, { kind: "singleton", factory });
  }
  registerFactory(token, factory) {
    this.registry.set(token, { kind: "factory", factory });
  }
  isRegistered(token) {
    return this.registry.has(token) || !!this.parent && this.parent.isRegistered(token);
  }
  resolve(token) {
    if (this.registry.has(token)) {
      const prov = this.registry.get(token);
      switch (prov.kind) {
        case "value":
          return prov.value;
        case "singleton":
          if (prov.instance === void 0) prov.instance = prov.factory();
          return prov.instance;
        case "factory":
          return prov.factory();
      }
    }
    if (this.parent) return this.parent.resolve(token);
    throw new Error(`Token not registered: ${String(token)}`);
  }
  override(token, provider) {
    this.registry.set(token, provider);
  }
  reset(tokens) {
    if (!tokens) return void this.registry.clear();
    for (const t of tokens) this.registry.delete(t);
  }
  createScope() {
    return new _Container(this);
  }
  overrideValue(token, value) {
    this.override(token, { kind: "value", value });
  }
  overrideSingleton(token, factory) {
    this.override(token, { kind: "singleton", factory });
  }
  overrideFactory(token, factory) {
    this.override(token, { kind: "factory", factory });
  }
};
var rootContainer = new Container();
var defineToken = (desc) => rootContainer.defineToken(desc);
var registerValue = (t, v) => rootContainer.registerValue(t, v);
var registerSingleton = (t, f) => rootContainer.registerSingleton(t, f);
var registerFactory = (t, f) => rootContainer.registerFactory(t, f);
var resolve = (t) => rootContainer.resolve(t);
var isRegistered = (t) => rootContainer.isRegistered(t);
var reset = (tokens) => rootContainer.reset(tokens);
var createScope = () => rootContainer.createScope();
var overrideValue = (t, v) => rootContainer.overrideValue(t, v);
var overrideSingleton = (t, f) => rootContainer.overrideSingleton(t, f);
var overrideFactory = (t, f) => rootContainer.overrideFactory(t, f);

// src/plugins.ts
var registrars = [];
function registerIOCPlugin(registrar) {
  registrars.push(registrar);
}
function getIOCPlugins() {
  return registrars.slice();
}
function _clearIOCPlugins() {
  registrars.length = 0;
}

// src/bootstrap.ts
var bootstrapped = false;
function bootstrapIOC() {
  if (bootstrapped) return;
  for (const reg of getIOCPlugins()) {
    reg(rootContainer);
  }
  bootstrapped = true;
}

// src/decorators.ts
var ReflectMeta = Reflect;
var paramTokens = /* @__PURE__ */ new WeakMap();
function Inject(tokenOrDesc) {
  return (target, _propertyKey, index) => {
    var _a;
    const existing = (_a = paramTokens.get(target)) != null ? _a : [];
    const token = typeof tokenOrDesc === "string" ? defineToken(tokenOrDesc) : tokenOrDesc;
    existing[index] = token;
    paramTokens.set(target, existing);
  };
}
function getConstructorTokens(target) {
  var _a, _b;
  const explicit = (_a = paramTokens.get(target)) != null ? _a : [];
  const designTypes = (_b = ReflectMeta.getMetadata) == null ? void 0 : _b.call(ReflectMeta, "design:paramtypes", target);
  const inferred = designTypes != null ? designTypes : [];
  const max = Math.max(explicit.length, inferred.length);
  const tokens = [];
  for (let i = 0; i < max; i++) {
    const provided = explicit[i];
    if (provided) {
      tokens.push(provided);
      continue;
    }
    const type = inferred[i];
    if (type && type.name && type.name !== "Object") {
      tokens.push(defineToken(type.name));
      continue;
    }
    throw new Error(`Token ausente para o par\xE2metro ${i} do construtor de ${target.name}. Adicione @Inject().`);
  }
  return tokens;
}
function Injectable(options = {}) {
  return (ctor) => {
    var _a, _b;
    const container = (_a = options.container) != null ? _a : rootContainer;
    const token = typeof options.token === "string" ? defineToken(options.token) : (_b = options.token) != null ? _b : defineToken(ctor.name);
    const deps = getConstructorTokens(ctor);
    const factory = () => new ctor(...deps.map((t) => container.resolve(t)));
    if (options.lifetime === "transient") {
      container.registerFactory(token, factory);
    } else {
      container.registerSingleton(token, factory);
    }
  };
}
function Resolve(tokenOrDesc) {
  return (target, propertyKey) => {
    const token = tokenOrDesc === void 0 ? defineToken(String(propertyKey)) : typeof tokenOrDesc === "string" ? defineToken(tokenOrDesc) : tokenOrDesc;
    Object.defineProperty(target, propertyKey, {
      get() {
        return rootContainer.resolve(token);
      },
      enumerable: true,
      configurable: true
    });
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Container,
  Inject,
  Injectable,
  Resolve,
  _clearIOCPlugins,
  bootstrapIOC,
  createScope,
  defineToken,
  getIOCPlugins,
  isRegistered,
  overrideFactory,
  overrideSingleton,
  overrideValue,
  registerFactory,
  registerIOCPlugin,
  registerSingleton,
  registerValue,
  reset,
  resolve,
  rootContainer
});
//# sourceMappingURL=index.cjs.map