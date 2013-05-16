function allow(req, res, next) {
    if (req.method === 'POST' && req.url === '/api/auth/login') {
        console.log('allowed login');
        res.writeHead(200);
        res.end();
    } else if (req.method === 'GET' && req.url === '/api/auth/check') {
        console.log('allowed check'); 
        res.writeHead(200);
        res.end();
    } else {
        next();
    }
}

function MockAuth() {}

MockAuth.prototype.allow = allow;

module.exports = new MockAuth;
