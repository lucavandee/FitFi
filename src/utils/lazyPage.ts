import { lazy, ComponentType } from "react";

export function lazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): T {
  return lazy(importFn) as T;
}