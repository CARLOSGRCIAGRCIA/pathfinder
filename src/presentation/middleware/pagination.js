export const paginationMiddleware = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const validSortFields = ['createdAt', 'updatedAt', 'name', '_id'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
    sort: { [sortField]: sortOrder },
  };

  next();
};

export const formatResponse = (data, pagination) => ({
  success: true,
  data,
  pagination: {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    pages: Math.ceil(pagination.total / pagination.limit),
    hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
    hasPrev: pagination.page > 1,
  },
});

export const paginateResults = async (model, query = {}, options = {}) => {
  const { page = 1, limit = 20, sort = { createdAt: -1 }, select = '', populate = [] } = options;

  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    model.find(query).select(select).populate(populate).sort(sort).skip(skip).limit(limit).lean(),
    model.countDocuments(query),
  ]);

  return {
    data: documents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};
