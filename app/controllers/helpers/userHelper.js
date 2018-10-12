'use strict';

const commonHelper = require('./generalHelper'),
  error = require('../../errors'),
  logger = require('../../logger'),
  domain = 'wolox',
  emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const _validateValidEmail = (body, next) => {
  if (!emailRegex.test(body.email)) {
    logger.info(`email ${body.email} is not valid.`);
    next(error.invalidEmail(`email ${body.email} is not valid.`));
  }
  return emailRegex.test(body.email);
};

const _validateValidDomainEmail = (body, next) => {
  let domainError = false;
  if (body.email.indexOf(domain) === -1) {
    logger.info(`invalid requested domain address ${body.email}.`);
    next(error.invalidDomainEmail(`email ${body.email} it's not a valid domain.`));
    domainError = true;
  }
  return domainError;
};

exports.validateValidDomainEmail = (body, next) => {
  return _validateValidDomainEmail(body, next);
};

exports.signUpValidations = (User, body, next) => {
  let validateError = false;
  if (!commonHelper.requiredAttributes(User, body)) {
    logger.info(`there were not send all required attributes.`);
    next(error.invalidRequedtedParams(`there were not send all required attributes.`));
    validateError = true;
  } else {
    validateError = _validateValidEmail(body, next);
    validateError = _validateValidDomainEmail(body, next);
    if (body.password.length < 8) {
      logger.info(`password does not have more than 8 characters.`);
      next(error.passwordLength(`password must have at least 8 characters length.`));
      validateError = true;
    }
  }
  return validateError;
};

exports.isAdmin = (userId, User) => {
  return new Promise((resolve, reject) => {
    User.findOne({ where: { id: userId } })
      .then(user => {
        resolve(user.admin);
      })
      .catch(err => {
        reject(err);
      });
  });
};

exports.validateAuthMethodsForListAlbums = (admin, subId, requestedId) => {
  let ret = false;
  if (admin) ret = true;
  else {
    if (subId === requestedId) ret = true;
  }
  return ret;
};
