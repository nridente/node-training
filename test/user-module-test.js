'user strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  dictum = require('dictum.js'),
  sinon = require('sinon'),
  logger = require('../app/logger'),
  md5 = require('md5'),
  models = require('../app/models'),
  server = require('../app.js'),
  userHelper = require('../app/controllers/helpers/userHelper.js'),
  albumService = require('../app/services/albumService.js'),
  jwt = require('jwt-simple'),
  config = require('../config'),
  moment = require('moment');

const User = models.User,
  Token = models.Token,
  AlbumsPerUser = models.Album_User;
chai.use(chaiHttp);

const setNewUser = userData => {
  userData.password = md5('password');
  User.create(userData);
};

describe('UserModule', () => {
  const userEndpoint = '/users',
    userId = 1,
    loginEndpoint = `${userEndpoint}/sessions`,
    listUsersEndpoint = `${userEndpoint}/page/`,
    fakeAlbumsResponse = [
      {
        id: 1,
        user_id: 1,
        album_id: 1,
        createdAt: '2018-10-11T19:27:40.490Z',
        updatedAt: '2018-10-11T19:27:40.490Z'
      },
      {
        id: 2,
        user_id: 1,
        album_id: 2,
        createdAt: '2018-10-11T19:27:46.122Z',
        updatedAt: '2018-10-11T19:27:46.122Z'
      }
    ],
    bodyToken = {
      sub: 1,
      iat: moment().unix(),
      exp: moment()
        .add(1, 'hours')
        .unix()
    },
    expiredBodyToken = {
      sub: 1,
      iat: moment().unix(),
      exp: moment()
        .add(-1, 'hours')
        .unix()
    },
    expiredTokenHeader = {
      'Content-Type': 'application/json',
      'X-Access-Token': jwt.encode(expiredBodyToken, config.common.jwt.secret_token)
    };
  let unAuthHeader = '',
    authHeader = '',
    userData = '',
    loginData = '',
    page = 1;
  beforeEach('re-estructure data for every test', done => {
    unAuthHeader = { 'Content-Type': 'application/json' };
    authHeader = {
      'Content-Type': 'application/json',
      'X-Access-Token': jwt.encode(bodyToken, config.common.jwt.secret_token)
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
    Token.create({
      disable_at: null,
      time_exp: 2,
      type_exp: 'hours',
      updatedAt: new Date(),
      createdAt: new Date()
    });
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
        expect(res.body).to.contain.keys('duration');
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

  it('test list all users when the token has expired', done => {
    chai
      .request(server)
      .get(listUsersEndpoint + page)
      .set(expiredTokenHeader)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal('expired session time');
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

  it('test list all user albums when user is not admin but is the authenticated with a mocked response', done => {
    const mockedIsAdmin = sinon.stub(userHelper, 'isAdmin').resolves(false),
      mockedValidations = sinon.stub(userHelper, 'validateAuthMethodsForListAlbums').returns(true),
      mockedAlbums = sinon.stub(AlbumsPerUser, 'findAll').resolves(fakeAlbumsResponse);
    chai
      .request(server)
      .get(`${userEndpoint}/1/albums`)
      .set(authHeader)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(mockedIsAdmin.calledOnce).to.be.true;
        expect(mockedValidations.calledOnce).to.be.true;
        expect(mockedAlbums.calledOnce).to.be.true;
        expect(typeof res.body).to.be.equal('object');
        expect(res.body.albums.length).to.not.be.equal(0);
        dictum.chai(res, 'list all user albums endpoint');
        mockedIsAdmin.restore();
        mockedValidations.restore();
        mockedAlbums.restore();
        done();
      });
  });

  it('test list all user albums when user is admin but is the authenticated with a mocked response', done => {
    const mockedIsAdmin = sinon.stub(userHelper, 'isAdmin').resolves(true),
      mockedValidations = sinon.stub(userHelper, 'validateAuthMethodsForListAlbums').returns(true),
      mockedAlbums = sinon.stub(AlbumsPerUser, 'findAll').resolves(fakeAlbumsResponse);
    chai
      .request(server)
      .get(`${userEndpoint}/1/albums`)
      .set(authHeader)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(mockedIsAdmin.calledOnce).to.be.true;
        expect(mockedValidations.calledOnce).to.be.true;
        expect(mockedAlbums.calledOnce).to.be.true;
        expect(typeof res.body).to.be.equal('object');
        expect(res.body.albums.length).to.not.be.equal(0);
        mockedIsAdmin.restore();
        mockedValidations.restore();
        mockedAlbums.restore();
        done();
      });
  });

  it('test list all user albums when user is admin but is not the authenticated with a mocked response', done => {
    const mockedIsAdmin = sinon.stub(userHelper, 'isAdmin').resolves(true),
      mockedValidations = sinon.stub(userHelper, 'validateAuthMethodsForListAlbums').returns(true),
      mockedAlbums = sinon.stub(AlbumsPerUser, 'findAll').resolves([]);
    chai
      .request(server)
      .get(`${userEndpoint}/2/albums`)
      .set(authHeader)
      .then(res => {
        expect(res.status).to.be.equal(200);
        expect(mockedIsAdmin.calledOnce).to.be.true;
        expect(mockedValidations.calledOnce).to.be.true;
        expect(mockedAlbums.calledOnce).to.be.true;
        expect(typeof res.body).to.be.equal('object');
        expect(res.body.albums.length).to.be.equal(0);
        mockedIsAdmin.restore();
        mockedValidations.restore();
        mockedAlbums.restore();
        done();
      });
  });

  it('test list all user albums when user is not admin and either not the authenticated', done => {
    const mockedIsAdmin = sinon.stub(userHelper, 'isAdmin').resolves(true),
      mockedValidations = sinon.stub(userHelper, 'validateAuthMethodsForListAlbums').returns(false);
    chai
      .request(server)
      .get(`${userEndpoint}/2/albums`)
      .set(authHeader)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(405);
        expect(mockedIsAdmin.calledOnce).to.be.true;
        expect(mockedValidations.calledOnce).to.be.true;
        expect(res.message).to.be.equal(
          'the authenticated user is not an admin and not the same as the request.'
        );
        expect(res.internal_code).to.be.equal('not_allowed');
        mockedIsAdmin.restore();
        mockedValidations.restore();
        done();
      });
  });

  it('test list all user albums when there is not any authenticated user', done => {
    chai
      .request(server)
      .get(`${userEndpoint}/2/albums`)
      .set(unAuthHeader)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.message).to.be.equal('user not authenticated');
        expect(res.internal_code).to.be.equal('authentication_error');
        done();
      });
  });

  it('test list album photos with a mocked response', done => {
    const fakePhotosResponse = [
        {
          albumId: 1,
          id: 1,
          title: 'accusamus beatae ad facilis cum similique qui sunt',
          url: 'https://via.placeholder.com/600/92c952',
          thumbnailUrl: 'https://via.placeholder.com/150/92c952'
        },
        {
          albumId: 1,
          id: 2,
          title: 'reprehenderit est deserunt velit ipsam',
          url: 'https://via.placeholder.com/600/771796',
          thumbnailUrl: 'https://via.placeholder.com/150/771796'
        },
        {
          albumId: 1,
          id: 3,
          title: 'officia porro iure quia iusto qui ipsa ut modi',
          url: 'https://via.placeholder.com/600/24f355',
          thumbnailUrl: 'https://via.placeholder.com/150/24f355'
        }
      ],
      mockedService = sinon.stub(albumService, 'getAlbumPhotos').resolves(fakePhotosResponse),
      mockedModel = sinon.stub(AlbumsPerUser, 'count').resolves(1);
    chai
      .request(server)
      .get(`${userEndpoint}/albums/1/photos`)
      .set(authHeader)
      .then(res => {
        expect(mockedService.calledOnce).to.be.true;
        expect(mockedModel.calledOnce).to.be.true;
        expect(res.status).to.be.equal(200);
        expect(typeof res.body).to.be.equal('object');
        expect(res.body.photos.length).to.not.be.equal(0);
        dictum.chai(res, 'list user album photos endpoint');
        mockedService.restore();
        mockedModel.restore();
        done();
      });
  });

  it('test list album fotos when the requested album is not purshased by the user', done => {
    const albumId = 1,
      mockedModel = sinon.stub(AlbumsPerUser, 'count').resolves(0);
    chai
      .request(server)
      .get(`${userEndpoint}/albums/${albumId}/photos`)
      .set(authHeader)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(mockedModel.calledOnce).to.be.true;
        expect(err.response.error).to.have.status(404);
        expect(res.internal_code).to.be.equal('album_not_found');
        expect(res.message).to.be.equal(`the requested album ${albumId} is not purshased for the user`);
        done();
      });
  });

  it('test list album photos when there is not authenticated user', done => {
    const albumId = 1;
    chai
      .request(server)
      .get(`${userEndpoint}/albums/${albumId}/photos`)
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
