interface OutputPagination<T> {
  count: number;
  page: number;
  pages: number;
  data: T[];
}

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
