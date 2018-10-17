'user strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  moment = require('moment'),
  expect = chai.expect,
  dictum = require('dictum.js'),
  logger = require('../app/logger'),
  md5 = require('md5'),
  models = require('../app/models'),
  server = require('../app.js'),
  jwt = require('jwt-simple'),
  config = require('../config');

const User = models.User,
  Token = models.Token;
chai.use(chaiHttp);

const setNewAdmin = adminData => {
  adminData.admin = true;
  User.create(adminData);
};

const setNewUser = userData => {
  User.create(userData);
};

describe('AdminModule', () => {
  const adminEndpoint = '/admin/users',
    tokenEndpoint = '/admin/token-settings',
    userData = {
      name: 'test-user',
      last_name: 'changing-admin',
      email: 'changing-admin@wolox.com.ar',
      password: md5('password')
    },
    bodyToken = {
      sub: 1,
      iat: moment().unix(),
      exp: moment()
        .add(1, 'hours')
        .unix()
    },
    tokenData = {
      time_exp: 5,
      type_exp: 'days'
    };
  let unAuthHeader = '',
    authHeader = '',
    adminData = '';

  beforeEach('re-estructure data for every test', done => {
    unAuthHeader = { 'Content-Type': 'application/json' };
    authHeader = {
      'Content-Type': 'application/json',
      'X-Access-Token': jwt.encode(bodyToken, config.common.jwt.secret_token)
    };
    adminData = {
      email: 'admin@wolox.com.ar',
      name: 'Admin',
      last_name: 'Total',
      password: md5('password')
    };
    Token.create({
      disable_at: null,
      time_exp: 2,
      type_exp: 'hours',
      updatedAt: new Date(),
      createdAt: new Date()
    });
    done();
  });

  it('create an admin when success', done => {
    chai
      .request(server)
      .post(adminEndpoint)
      .set(authHeader)
      .send(adminData)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.text).to.be.equal('admin Total Admin created.');
        dictum.chai(res, 'create admin endpoint');
        done();
      });
  });

  it('set user as admin when the user already exists but is not an admin', done => {
    setNewUser(userData);
    chai
      .request(server)
      .post(adminEndpoint)
      .set(authHeader)
      .send(userData)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.text).to.be.equal(`user changing-admin test-user is now an admin.`);
        done();
      });
  });

  it('create / set new admin when the user is already an admin', done => {
    setNewAdmin(adminData);
    chai
      .request(server)
      .post(adminEndpoint)
      .set(authHeader)
      .send(adminData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_email');
        expect(res.message).to.be.equal(`an admin already exists with the email admin@wolox.com.ar.`);
        done();
      });
  });

  it('try to create / set new admin when there is not authenticated user', done => {
    chai
      .request(server)
      .post(adminEndpoint)
      .set(unAuthHeader)
      .send(adminData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal(`user not authenticated`);
        done();
      });
  });

  it('create new admin when the email is not in the valid domain address', done => {
    adminData.email = 'admin@gmail.com';
    chai
      .request(server)
      .post(adminEndpoint)
      .set(authHeader)
      .send(adminData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_domain_email');
        expect(res.message).to.be.equal(`email admin@gmail.com it's not a valid domain.`);
        done();
      });
  });

  it('create new admin when one of the required params is not sent', done => {
    delete adminData.name;
    chai
      .request(server)
      .post(adminEndpoint)
      .set(authHeader)
      .send(adminData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_requested_params');
        expect(res.message).to.be.equal(`there were not send all required attributes.`);
        done();
      });
  });

  it('create new admin when the email is not valid', done => {
    adminData.email = 'wrong_email';
    chai
      .request(server)
      .post(adminEndpoint)
      .set(authHeader)
      .send(adminData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_email');
        expect(res.message).to.be.equal(`email wrong_email is not valid.`);
        done();
      });
  });

  it('create new admin when the password doesnt feed the requeriments', done => {
    adminData.password = 'only5';
    chai
      .request(server)
      .post(adminEndpoint)
      .set(authHeader)
      .send(adminData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_password_length');
        expect(res.message).to.be.equal('password must have at least 8 characters length.');
        done();
      });
  });

  it('test change token settings when authenticated user is not an admin', done => {
    setNewUser(userData);
    chai
      .request(server)
      .post(tokenEndpoint)
      .set(authHeader)
      .send(tokenData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(405);
        expect(res.internal_code).to.be.equal('not_allowed');
        expect(res.message).to.be.equal('refused conexion becouse not enough permissions');
        done();
      });
  });

  it('test change token settings when everything its ok', done => {
    setNewAdmin(adminData);
    chai
      .request(server)
      .post(tokenEndpoint)
      .set(authHeader)
      .send(tokenData)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.text).to.be.equal('token settings saved');
        dictum.chai(res, 'update token settings endpoint');
        done();
      });
  });

  it.only('test change token settings when authenticated user is admin but has not token', done => {
    setNewAdmin(adminData);
    chai
      .request(server)
      .post(tokenEndpoint)
      .set(unAuthHeader)
      .send(tokenData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal('user not authenticated');
        done();
      });
  });
});
