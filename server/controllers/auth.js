var http = require('http'),
    q = require('q'),
    request = require('request'),
    reqRoot;

function configure(app) {
    reqRoot = app.get('reqRoot');
}

function login(req, res) {
    var options = {
        uri: reqRoot + '/api/auth/login/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
    };

    request(options, function(err, response, body) {
        if (!err) {
            var headers = {};
            headers['Set-Cookie'] = response.headers['set-cookie'];
            headers['Access-Control-Allow-Methods'] = response.headers['access-control-allow-methods'];
            headers['Access-Control-Allow-Headers'] = response.headers['access-control-allow-headers'];
            headers['Server'] = response.headers['server'];
            headers['Content-Type'] = response.headers['content-type'];
            headers['Content-Length'] = 0;
            res.writeHead(response.statusCode, headers);
            res.end();
        } else {
            console.log(err)
        }
    });
}


function logout(req, res) {
    var options = {
        uri: reqRoot + '/api/auth/logout',
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    };
    request(options, function(err, response, body) {
        if (!err) {
            res.send(response.statusCode);
        } else {
            console.log(err);
        }
    });
}

function checkPing(req, res) {
    var options = {
        uri: reqRoot + '/api/auth/check',
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    };
    request(options, function(err, response, body) {
        if (!err) {
            res.send(response.statusCode);
        } else {
            console.log(err);
        }
    });
}

function checkEach(req, res, next) {
    if (req.url === '/api/auth/login/' || req.url === '/api/auth/check') {
        next();
    } else {
        var options = {
            uri: reqRoot + '/api/auth/check',
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        };
        request(options, function(err, response, body) {
            if (!err) {
                if (response.statusCode !== 200) {
                    res.send(response.statusCode);
                } else {
                    next();
                }
            } else {
                console.log(err);
            }
        });
    }
}

function Auth() {}

Auth.prototype.configure = configure;
Auth.prototype.login = login;
Auth.prototype.logout = logout;
Auth.prototype.checkEach = checkEach;
Auth.prototype.checkPing = checkPing;

module.exports = new Auth;
