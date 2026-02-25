interface IOptions {
  page: number | string;
  limit: number | string;
  skip: number;
}

const paginationHelper = (options: Partial<IOptions>) => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 5;
  const skip = limit * (page - 1);
  return { page, limit, skip };
};

export default paginationHelper;
