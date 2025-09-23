export const paginationMiddleware = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: "Invalid pagination parameters",
    });
  }

  req.pagination = {
    skip: (page - 1) * limit,
    limit: limit,
  };

  next();
};