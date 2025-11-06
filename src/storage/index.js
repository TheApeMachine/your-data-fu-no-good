import { getDuckDBBinding } from './duckdb-binding';
export function resolveDatabase(env) {
    if (env && env.DB) {
        return env.DB;
    }
    const binding = getDuckDBBinding();
    if (env) {
        env.DB = binding;
    }
    return binding;
}
