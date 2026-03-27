export interface IQueryParams {
  searchTerm?: string;
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: string;
  fields?: string;
  include?: string;
  [key: string]: unknown;
}

export interface IQueryConfig {
  searchableFields?: string[];
  filterableFields?: string[];
}

export interface IQueryResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Minimal shape for Prisma model delegates
export interface PrismaModelDelegate {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
}

export interface PrismaFindManyArgs {
  where?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  skip?: number;
  take?: number;
}

export interface PrismaCountArgs {
  where?: Record<string, unknown>;
}

export interface PrismaWhereConditions {
  OR?: Record<string, unknown>[];
  AND?: Record<string, unknown>[];
  NOT?: Record<string, unknown>[];
  [key: string]: unknown;
}

export type PrismaStringFilter = {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: 'insensitive' | 'default';
  equals?: string;
};

export type PrismaNumberFilter = {
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  equals?: number;
  not?: number;
  in?: number[];
  notIn?: number[];
};
