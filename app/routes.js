const userController = require('./controllers/userController'),
  logger = require('./logger'),
  error = require('./errors');

const _isAuthenticated = (req, res, next) => {
  const token = req.headers['x-access-token'];
  logger.info(`token header: ${token}`);
  if (!token) {
    logger.info('refused request because user is not authenticated');
    return next(error.authenticationError('user not authenticated'));
  }
  next();
};

exports.init = app => {
  app.get('/users/page/:page', [_isAuthenticated], userController.getAllUsers);
  app.post('/users', [], userController.setUser);
  app.post('/users/sessions', [], userController.signIn);
};
