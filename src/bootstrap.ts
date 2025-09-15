// src/bootstrap.ts
import { rootContainer } from './container';
import { getIOCPlugins } from './plugins';

let bootstrapped = false;

/**
 * Executa todos os registrars previamente registrados (plugins de módulos).
 * Deve ser chamado uma única vez no início do app.
 */
export function bootstrapIOC(): void {
  if (bootstrapped) return;
  for (const reg of getIOCPlugins()) {
    reg(rootContainer);
  }
  bootstrapped = true;
}

export default bootstrapIOC;
