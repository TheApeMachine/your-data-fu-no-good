export type RunMeta = {
  last_row_id?: number;
};

export interface QueryOptions {
  limit?: number;
  skipLastId?: boolean;
}

export interface PreparedStatement {
  bind(...params: any[]): PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta: RunMeta }>;
  // Internal fields used by the DuckDB shim; optional so native D1 statements are still compatible.
  sql?: string;
  params?: any[];
}

export interface DatabaseBinding {
  prepare(sql: string): PreparedStatement;
  batch(statements: PreparedStatement[]): Promise<void>;
  query<T = unknown>(sql: string, params?: any[], options?: QueryOptions): Promise<T[]>;
  execute(sql: string, params?: any[], options?: QueryOptions): Promise<RunMeta>;
}
