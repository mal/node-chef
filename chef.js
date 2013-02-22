var hash = require('crypto').createHash,
    url = require('url'),

    pkey = require('ursa').coercePrivateKey,
    request = require('request');

function sha1(str) {
    return hash('sha1').update(str).digest('base64');
}

function Chef(user, key, base) {
    this.user = user;
    this.key = key;
    this.base = base ? base : '';
}

function req(method, uri, body, _) {

    method = method.toUpperCase()

    if ( !~uri.indexOf(this.base) )
        uri = this.base + uri;

    if ( typeof body === 'function' )
        _ = body, body = undefined;

    var timestamp = new Date().toISOString().slice(0, -5) + 'Z',
        pathHash = sha1(url.parse(uri).path),
        bodyHash = sha1(body ? JSON.stringify(body) : ''),

        req = 'Method:' + method + '\n'
            + 'Hashed Path:' + pathHash + '\n'
            + 'X-Ops-Content-Hash:' + bodyHash + '\n'
            + 'X-Ops-Timestamp:' + timestamp + '\n'
            + 'X-Ops-UserId:' + this.user,

        sig = pkey(this.key).privateEncrypt(req, 'utf8', 'base64'),

        headers = {
            Accept: 'application/json',
            'X-Ops-Timestamp': timestamp,
            'X-Ops-UserId': this.user,
            'X-Ops-Content-Hash': bodyHash,
            'X-Chef-Version': '0.10.4',
            'X-Ops-Sign': 'version=1.0'
        };

        sig.match(/.{1,60}/g).forEach(function (hash, line) {
            headers['X-Ops-Authorization-' + ++line] = hash
        });

        request(uri, {
            method: method,
            headers: headers,
            body: body
        }, function (err, resp, body) {
            if (err) _(err);
            _(null, JSON.parse(body));
        });

}

var methods = ['delete', 'get', 'post', 'put', 'update'];
methods.forEach(function (method) {
    Chef.prototype[method] = function (uri, body, _) {
        req.call(this, method, uri, body, _);
    }
});

module.exports = Chef;
