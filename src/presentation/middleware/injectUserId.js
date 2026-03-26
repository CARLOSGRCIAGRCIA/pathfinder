export const injectUserId = () => (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next(new Error('User not found in request'));
    }

    if (req.body) {
      req.body.creator = req.user._id;
    }

    next();
  } catch (error) {
    next(error);
  }
};
