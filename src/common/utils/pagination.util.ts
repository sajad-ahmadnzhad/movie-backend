import {
  FindManyOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from "typeorm";

interface OutputPagination<T> {
  count: number;
  page: number;
  pages: number;
  data: T[];
}

export const cachePagination = async <T>(
  limitQuery: number = 20,
  pageQuery: number = 1,
  cachedData: T[]
): Promise<OutputPagination<T>> => {
  const page = pageQuery || 1;
  const pageSize = limitQuery || 20;
  const skip = (page - 1) * pageSize;

  const total = cachedData.length;

  const pages = Math.ceil(total / pageSize);

  const filteredData = cachedData.slice(skip, skip + pageSize);

  return {
    count: filteredData.length,
    page,
    pages,
    data: filteredData,
  };
};

export const pagination = <T>(
  limitQuery: number = 20,
  pageQuery: number = 1,
  data: T[]
): OutputPagination<T> => {
  const page = pageQuery || 1;
  const pageSize = limitQuery || 20;
  const skip = (page - 1) * pageSize;

  const total = data.length;

  const pages = Math.ceil(total / pageSize);

  const filteredData = data.slice(skip, skip + pageSize);

  return {
    count: filteredData.length,
    page,
    pages,
    data: filteredData,
  };
};

export const typeORMPagination = async <T extends ObjectLiteral>(
  limitQuery: number = 20,
  pageQuery: number = 1,
  repository: Repository<T>,
  options: FindManyOptions<T> = {}
): Promise<OutputPagination<T>> => {
  const page = pageQuery || 1;
  const pageSize = limitQuery || 20;
  const skip = (page - 1) * pageSize;

  const [result, total] = await repository.findAndCount({
    ...options,
    skip,
    take: pageSize,
  });

  const pages = Math.ceil(total / pageSize);

  return {
    count: result.length,
    page,
    pages,
    data: result,
  };
};

export const typeormQueryBuilderPagination = async <T extends ObjectLiteral>(
  limitQuery: number = 20,
  pageQuery: number = 1,
  repository: Repository<T>,
  options?: SelectQueryBuilder<T>
): Promise<OutputPagination<T>> => {
  const page = pageQuery || 1;
  const pageSize = limitQuery || 20;
  const skip = (page - 1) * pageSize;

  let queryBuilder = repository.createQueryBuilder("entity");

  if (options) {
    queryBuilder = options;
  }

  const [result, total] = await queryBuilder
    .skip(skip)
    .take(pageSize)
    .getManyAndCount();

  const pages = Math.ceil(total / pageSize);

  return {
    count: result.length,
    page,
    pages,
    data: result,
  };
};
