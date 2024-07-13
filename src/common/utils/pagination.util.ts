import { FindManyOptions, ObjectLiteral, Repository } from "typeorm";

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
