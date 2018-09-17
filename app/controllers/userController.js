const models = require('../models'),
  error = require('../errors'),
  logger = require('../logger'),
  util = require('util'),
  md5 = require('md5');

const User = models.User,
  domain = 'wolox',
  emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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
  logger.info(body.email.indexOf(domain));
  if (!emailRegex.test(body.email)) {
    logger.info(`email ${body.email} is not valid.`);
    next(error.invalidEmail(`email ${body.email} is not valid.`));
  }
  if (body.email.indexOf(domain) === -1) {
    logger.info(`invalid requested domain address ${body.email}.`);
    next(error.invalidDomainEmail(`email ${body.email} it's not a valid domain.`));
  }
  if (body.password.length < 8) {
    logger.info(`password does not have more than 8 characters.`);
    next(error.passwordLength(`password must have at least 8 characters length.`));
  }
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
