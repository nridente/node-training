'user strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  dictum = require('dictum.js'),
  sinon = require('sinon'),
  logger = require('../app/logger'),
  server = require('../app.js'),
  albunService = require('../app/services/albumService.js');

chai.use(chaiHttp);

describe('AlbumModule', () => {
  const albumEndpoint = '/albums',
    unAuthHeader = { 'Content-Type': 'application/json' },
    authHeader = {
      'Content-Type': 'application/json',
      'X-Access-Token': 'xample-token'
    },
    expectedResponse = [
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
    ];

  it('test list all albums when success with mocked service response', done => {
    const mockedService = sinon.stub(albunService, 'getAllAlbums').resolves(expectedResponse);
    chai
      .request(server)
      .get(albumEndpoint)
      .set(authHeader)
      .then(res => {
        expect(mockedService.calledOnce).to.be.true;
        const response = JSON.parse(res.text);
        expect(response.data.length).to.be.equal(2);
        dictum.chai(res, 'list all albums');
        done();
      });
  });

  it('test list all albums when user is not authenticated', done => {
    chai
      .request(server)
      .get(albumEndpoint)
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
