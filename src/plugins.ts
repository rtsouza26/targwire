// src/plugins.ts
import type { Container } from './container';

export type IOCRegistrar = (c: Container) => void;

const registrars: IOCRegistrar[] = [];

export function registerIOCPlugin(registrar: IOCRegistrar) {
  registrars.push(registrar);
}

/** Apenas leitura (sem expor o array interno) */
export function getIOCPlugins(): IOCRegistrar[] {
  return registrars.slice();
}

/** Para testes: limpar a lista de registrars */
export function _clearIOCPlugins() {
  registrars.length = 0;
}
