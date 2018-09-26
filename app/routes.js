const userController = require('./controllers/userController');

exports.init = app => {
  app.get('/users/:email', [], userController.getUser);
  app.get('/users', [], userController.getAllUsers);
  app.post('/users', [], userController.setUser);
  app.post('/users/sessions', [], userController.signIn);
};
