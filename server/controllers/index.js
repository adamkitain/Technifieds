var crud = require('./crud'),
    auth = require('./auth'),
    xDomain = require('./xDomain'),
    mockAuth = require('./mockAuth');    

function Controllers() {}

Controllers.prototype.crud = crud;
Controllers.prototype.auth = auth;
Controllers.prototype.xDomain = xDomain;
Controllers.prototype.mockAuth = mockAuth;

module.exports = new Controllers;
