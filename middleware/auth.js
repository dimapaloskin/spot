'use strict';

module.exports = (req, res, next) => {

  if (!req.isAuthenticated()) {
    res.status(401);
    return res.json({
      error: {
        status: 401,
        message: 'Unauthorized'
      }
    });
  }

  next();
};
