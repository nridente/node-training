'user strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  dictum = require('dictum.js'),
  logger = require('../app/logger'),
  md5 = require('md5'),
  models = require('../app/models'),
  server = require('../app.js');

const User = models.User;
chai.use(chaiHttp);

const setNewUser = userData => {
  userData.password = md5('password');
  User.create(userData);
};

describe('UserModule', () => {
  const userEndpoint = '/users',
    loginEndpoint = `${userEndpoint}/sessions`,
    listUsersEndpoint = `${userEndpoint}/page/`;
  let unAuthHeader = '',
    authHeader = '',
    userData = '',
    loginData = '',
    page = 1;

  beforeEach('re-estructure data for every test', done => {
    unAuthHeader = { 'Content-Type': 'application/json' };
    authHeader = {
      'Content-Type': 'application/json',
      'X-Access-Token': 'xample-token'
    };
    userData = {
      email: 'email@wolox.com.ar',
      name: 'Valdomero',
      last_name: 'Lord',
      password: 'password'
    };
    loginData = {
      email: 'email@wolox.com.ar',
      password: 'password'
    };
    done();
  });

  it('test create user when success', done => {
    chai
      .request(server)
      .post(userEndpoint)
      .set(unAuthHeader)
      .send(userData)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.text).to.be.equal('user Lord Valdomero created.');
        dictum.chai(res, 'create user endpoint');
        done();
      });
  });

  it('test create user when email is in use', done => {
    setNewUser(userData);
    chai
      .request(server)
      .post(userEndpoint)
      .set(unAuthHeader)
      .send(userData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_email');
        expect(res.message).to.be.equal('email: email@wolox.com.ar already exists.');
        done();
      });
  });

  it('test create user when the password does not feed the requeriments', done => {
    userData.password = 'only5';
    chai
      .request(server)
      .post(userEndpoint)
      .set(unAuthHeader)
      .send(userData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_password_length');
        expect(res.message).to.be.equal('password must have at least 8 characters length.');
        done();
      });
  });

  it('test create function when email domain is not the valid one', done => {
    userData.email = 'valdomerus@lord.com';
    chai
      .request(server)
      .post(userEndpoint)
      .set(unAuthHeader)
      .send(userData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_domain_email');
        expect(res.message).to.be.equal(`email valdomerus@lord.com it's not a valid domain.`);
        done();
      });
  });

  it('test create client when at least one of the required fields is not send', done => {
    delete userData.password;
    chai
      .request(server)
      .post(userEndpoint)
      .set(unAuthHeader)
      .send(userData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_requested_params');
        expect(res.message).to.be.equal(`there were not send all required attributes.`);
        done();
      });
  });

  it('test sign in when success', done => {
    setNewUser(userData);
    chai
      .request(server)
      .post(loginEndpoint)
      .set(unAuthHeader)
      .send(loginData)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(res.body).to.contain.keys('token');
        dictum.chai(res, 'sign in endpoint');
        done();
      });
  });

  it('test sign in when the password is wrong', done => {
    loginData.password = 'only5';
    chai
      .request(server)
      .post(loginEndpoint)
      .set(unAuthHeader)
      .send(loginData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal(`either email or password are wrong.`);
        done();
      });
  });

  it('test sign in when the email is wrong', done => {
    loginData.password = 'password';
    loginData.email = 'email_wrong@wolox.com.ar';
    chai
      .request(server)
      .post(loginEndpoint)
      .set(unAuthHeader)
      .send(loginData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal(`either email or password are wrong.`);
        done();
      });
  });

  it('test sign in when the email and password are wrong', done => {
    loginData.password = 'only5';
    loginData.email = 'email_wrong@wolox.com.ar';
    chai
      .request(server)
      .post(loginEndpoint)
      .set(unAuthHeader)
      .send(loginData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal(`either email or password are wrong.`);
        done();
      });
  });

  it('test sign in when the email domain is not the available one', done => {
    loginData.email = 'email@yahoo.com.ar';
    chai
      .request(server)
      .post(loginEndpoint)
      .set(unAuthHeader)
      .send(loginData)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('invalid_domain_email');
        expect(res.message).to.be.equal(`email email@yahoo.com.ar it's not a valid domain.`);
        done();
      });
  });

  it('test list all users with pagination when success', done => {
    setNewUser(userData);
    chai
      .request(server)
      .get(listUsersEndpoint + page)
      .set(authHeader)
      .then(res => {
        const text = JSON.parse(res.text),
          users = JSON.parse(text.users);
        expect(res).to.have.status(200);
        expect(users.length).to.be.equal(1);
        expect(text.current_page).to.be.equal('1');
        expect(text.pages).to.be.equal(1);
        dictum.chai(res, 'list users endpoint with pagination');
        done();
      });
  });

  it('test list all users with pagination, returns 1 page and request page 2', done => {
    setNewUser(userData);
    page = 2;
    chai
      .request(server)
      .get(listUsersEndpoint + page)
      .set(authHeader)
      .then(res => {
        const text = JSON.parse(res.text),
          users = JSON.parse(text.users);
        expect(res).to.have.status(200);
        expect(users.length).to.be.equal(0);
        expect(text.current_page).to.be.equal('2');
        expect(text.pages).to.be.equal(1);
        done();
      });
  });

  it('test list all users when users is not authenticated', done => {
    chai
      .request(server)
      .get(listUsersEndpoint + page)
      .set(unAuthHeader)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal(`user not authenticated`);
        done();
      });
  });
});
