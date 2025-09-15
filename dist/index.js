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
export {
  Container,
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
};
//# sourceMappingURL=index.js.map