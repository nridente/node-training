'use strict';

const commonHelper = require('./generalHelper'),
  error = require('../../errors'),
  logger = require('../../logger'),
  domain = 'wolox',
  emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

exports.signUpValidations = (User, body, next) => {
  if (!commonHelper.requiredAttributes(User, body)) {
    logger.info(`there were not send all required attributes.`);
    next(error.invalidRequedtedParams(`there were not send all required attributes.`));
  }
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
};
