import type { DatabaseBinding } from './types';
import { getDuckDBBinding } from './duckdb-binding';

export function resolveDatabase(env: any): DatabaseBinding {
  if (env && env.DB) {
    return env.DB as DatabaseBinding;
  }
  const binding = getDuckDBBinding();
  if (env) {
    env.DB = binding;
  }
  return binding;
}
