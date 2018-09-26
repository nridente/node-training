'user strict';

const models = require('../models'),
  error = require('../errors'),
  logger = require('../logger'),
  md5 = require('md5'),
  User = models.User,
  jwtService = require('../services/jwt'),
  userHelper = require('./helpers/userHelper');

exports.getAllUsers = (req, res, next) => {
  User.findAndCountAll().then(users => {
    res.send(JSON.stringify(users));
  });
};

exports.getUser = (req, res, next) => {
  User.findOne({ where: { email: req.params.email } }).then(user => {
    res.send(JSON.stringify(user));
  });
};

exports.setUser = (req, res, next) => {
  const body = req.body;
  let output;
  userHelper.signUpValidations(User, body, next);
  User.findOne({ where: { email: body.email } }).then(user => {
    if (user) next(error.invalidEmail(`email: ${body.email} already exists.`));
    User.create({
      email: body.email,
      name: body.name,
      last_name: body.last_name,
      password: md5(body.password)
    })
      .then(() => {
        logger.info(`user ${body.last_name} ${body.name} created.`);
        return res.send(`user ${body.last_name} ${body.name} created.`);
      })
      .catch(err => {
        logger.info(err);
        next(err);
      });
  });
};

exports.signIn = (req, res, next) => {
  const body = req.body;
  userHelper.validateValidDomainEmail(body, next);
  User.count({ where: { email: body.email, password: md5(body.password) } })
    .then(user => {
      if (user) {
        return res.send({ token: jwtService.createToken(user) });
      } else {
        logger.info(`either email or password are wrong.`);
        next(error.authenticationError(`either email or password are wrong.`));
      }
    })
    .catch(err => {
      logger.info(err);
      next(err);
    });
};
