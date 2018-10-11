'user strict';

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  logger = require('../app/logger'),
  albumService = require('../app/services/albumService.js');

chai.use(chaiHttp);

describe('AlbumService', () => {
  it('test get all albums service its ok', done => {
    albumService.getAllAlbums().then(res => {
      expect(typeof res).to.equal('object');
      done();
    });
  });

  it('test get album service its ok', done => {
    albumService.getAlbum(1).then(res => {
      expect(typeof res).to.be.equal('object');
      done();
    });
  });
});
