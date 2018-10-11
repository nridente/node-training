'user strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  dictum = require('dictum.js'),
  sinon = require('sinon'),
  logger = require('../app/logger'),
  server = require('../app.js'),
  albumService = require('../app/services/albumService.js'),
  albumController = require('../app/controllers/albumController.js'),
  models = require('../app/models'),
  AlbumPerUser = models.Album_User;

chai.use(chaiHttp);

const _insertAlbumPerUser = () => {
  AlbumPerUser.create({
    user_id: 1,
    album_id: 1
  });
};

describe('AlbumModule', () => {
  const ListAlbumEndpoint = '/albums',
    albumId = 1,
    getAlbumEndpoint = `/albums/${albumId}`,
    unAuthHeader = { 'Content-Type': 'application/json' },
    authHeader = {
      'Content-Type': 'application/json',
      'X-Access-Token': 'xample-token'
    },
    expectedResponseForList = [
      {
        userId: 1,
        id: 1,
        title: 'quidem molestiae enim'
      },
      {
        userId: 1,
        id: 2,
        title: 'sunt qui excepturi placeat culpa'
      }
    ],
    expectedAlbumResponse = {
      userId: 1,
      id: 1,
      title: 'quidem molestiae enim'
    };

  it.skip('test list all albums when success with mocked service response', done => {
    const mockedService = sinon.stub(albumService, 'getAllAlbums').resolves(expectedResponseForList);
    chai
      .request(server)
      .get(ListAlbumEndpoint)
      .set(authHeader)
      .then(res => {
        expect(mockedService.calledOnce).to.be.true;
        const response = JSON.parse(res.text);
        expect(response.data.length).to.be.equal(2);
        dictum.chai(res, 'list all albums');
        albumService.getAllAlbums.restore();
        done();
      });
  });

  it.skip('test list all albums when user is not authenticated', done => {
    chai
      .request(server)
      .get(ListAlbumEndpoint)
      .set(unAuthHeader)
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal(`user not authenticated`);
        done();
      });
  });

  it('test buy an album with a mocked one and response succesfully', done => {
    const mockedService = sinon.stub(albumService, 'getAlbum').resolves(expectedAlbumResponse);
    chai
      .request(server)
      .post(getAlbumEndpoint)
      .set(authHeader)
      .send({ user_id: 1 })
      .then(res => {
        expect(mockedService.calledOnce).to.be.true;
        AlbumPerUser.findAndCountAll().then(results => {
          expect(results.count).to.be.equal(1);
        });
        albumService.getAlbum.restore();
        dictum.chai(res, 'purshase album endpoint');
        done();
      });
  });

  it.skip('test buy an album with a mocked empty response', done => {
    const mockedService = sinon.stub(albumService, 'getAlbum').resolves([]);
    chai
      .request(server)
      .post(getAlbumEndpoint)
      .set(authHeader)
      .send({ user_id: 1 })
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(404);
        expect(res.internal_code).to.be.equal('album_not_found');
        expect(res.message).to.be.equal(`not albums where found with the requested id ${albumId}`);
        done();
      });
  });

  it.skip('test buy an album and the user already purshased it', done => {
    _insertAlbumPerUser();
    chai
      .request(server)
      .post(getAlbumEndpoint)
      .set(authHeader)
      .send({ user_id: 1 })
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(400);
        expect(res.internal_code).to.be.equal('album_already_purshased');
        expect(res.message).to.be.equal(`album already purchased by this user`);
        done();
      });
  });

  it.skip('test buy album when user is not authenticated', done => {
    chai
      .request(server)
      .post(getAlbumEndpoint)
      .set(unAuthHeader)
      .send({ user_id: 1 })
      .catch(err => {
        const res = JSON.parse(err.response.error.text);
        expect(err.response.error).to.have.status(401);
        expect(res.internal_code).to.be.equal('authentication_error');
        expect(res.message).to.be.equal('user not authenticated');
        done();
      });
  });
});
