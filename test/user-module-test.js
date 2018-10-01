'user strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  logger = require('../app/logger'),
  md5 = require('md5'),
  models = require('../app/models');

const User = models.User;
chai.use(chaiHttp);

const setNewUser = userData => {
  userData.password = md5('password');
  User.create(userData);
};

describe('UserModule', () => {
  const host = 'http://localhost:8080',
    userEndpoint = '/users',
    loginEndpoint = `${userEndpoint}/sessions`;
  let header = '',
    userData = '',
    loginData = '';

  beforeEach('re-estructure data for every test', done => {
    header = { 'Content-Type': 'application/json' };
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
      .request(host)
      .post(userEndpoint)
      .set(header)
      .send(userData)
      .end((err, res) => {
        expect(res.status).to.be.equal(200);
        expect(res.text).to.be.equal('user Lord Valdomero created.');
        done();
      });
  });

  it('test create user when email is in use', done => {
    setNewUser(userData);
    chai
      .request(host)
      .post(userEndpoint)
      .set(header)
      .send(userData)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.internal_code).to.be.equal('invalid_email');
        expect(res.body.message).to.be.equal('email: email@wolox.com.ar already exists.');
        done();
      });
  });

  it('test create user when the password does not feed the requeriments', done => {
    userData.password = 'only5';
    chai
      .request(host)
      .post(userEndpoint)
      .set(header)
      .send(userData)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.internal_code).to.be.equal('invalid_password_length');
        expect(res.body.message).to.be.equal('password must have at least 8 characters length.');
        done();
      });
  });

  it('test create function when email domain is not the valid one', done => {
    userData.email = 'valdomerus@lord.com';
    chai
      .request(host)
      .post(userEndpoint)
      .set(header)
      .send(userData)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.internal_code).to.be.equal('invalid_domain_email');
        expect(res.body.message).to.be.equal(`email valdomerus@lord.com it's not a valid domain.`);
        done();
      });
  });

  it('test create client when at least one of the required fields is not send', done => {
    delete userData.password;
    chai
      .request(host)
      .post(userEndpoint)
      .set(header)
      .send(userData)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.internal_code).to.be.equal('invalid_requested_params');
        expect(res.body.message).to.be.equal('there were not send all required attributes.');
        done();
      });
  });

  it('test sign in when success', done => {
    setNewUser(userData);
    chai
      .request(host)
      .post(loginEndpoint)
      .set(header)
      .send(loginData)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.contain.keys('token');
        done();
      });
  });

  it('test sign in when the password is wrong', done => {
    loginData.password = 'only5';
    chai
      .request(host)
      .post(loginEndpoint)
      .set(header)
      .send(loginData)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.internal_code).to.be.equal('authentication_error');
        expect(res.body.message).to.be.equal('either email or password are wrong.');
        done();
      });
  });

  it('test sign in when the email is wrong', done => {
    loginData.password = 'password';
    loginData.email = 'email_wrong@wolox.com.ar';
    chai
      .request(host)
      .post(loginEndpoint)
      .set(header)
      .send(loginData)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.internal_code).to.be.equal('authentication_error');
        expect(res.body.message).to.be.equal('either email or password are wrong.');
        done();
      });
  });

  it('test sign in when the email and password are wrong', done => {
    loginData.password = 'only5';
    loginData.email = 'email_wrong@wolox.com.ar';
    chai
      .request(host)
      .post(loginEndpoint)
      .set(header)
      .send(loginData)
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body.internal_code).to.be.equal('authentication_error');
        expect(res.body.message).to.be.equal('either email or password are wrong.');
        done();
      });
  });

  it('test sign in when the email domain is not the available one', done => {
    loginData.email = 'email@yahoo.com.ar';
    chai
      .request(host)
      .post(loginEndpoint)
      .set(header)
      .send(loginData)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body.internal_code).to.be.equal('invalid_domain_email');
        expect(res.body.message).to.be.equal(`email email@yahoo.com.ar it's not a valid domain.`);
        done();
      });
  });
});
