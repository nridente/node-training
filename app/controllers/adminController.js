'user strict';

const models = require('../models'),
  error = require('../errors'),
  logger = require('../logger'),
  md5 = require('md5'),
  User = models.User,
  jwtService = require('../services/jwt'),
  userHelper = require('./helpers/userHelper');

const createAdmin = (body, res, next) => {
  User.create({
    email: body.email,
    name: body.name,
    last_name: body.last_name,
    password: md5(body.password),
    admin: true
  })
    .then(() => {
      logger.info(`admin ${body.last_name} ${body.name} created.`);
      return res.send(`admin ${body.last_name} ${body.name} created.`);
    })
    .catch(err => {
      logger.info(err);
      next(err);
    });
};

const updateAdmin = (user, body, res, next) => {
  user
    .update({
      admin: true
    })
    .then(() => {
      logger.info(`user ${body.last_name} ${body.name} is now an admin.`);
      return res.send(`user ${body.last_name} ${body.name} is now an admin.`);
    })
    .catch(err => {
      logger.info(err);
      return next(err);
    });
};

exports.setAdmin = (req, res, next) => {
  const body = req.body;
  if (!userHelper.signUpValidations(User, body, next)) {
    User.findOne({ where: { email: body.email } }).then(user => {
      if (user && user.admin) {
        return next(error.invalidEmail(`an admin already exists with the email ${body.email}.`));
      } else if (user && !user.admin) {
        updateAdmin(user, body, res, next);
      } else {
        createAdmin(body, res, next);
      }
    });
  }
};
