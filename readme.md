node-chef
=========

Handles the basic authentication so you can get on with Cheffing.

### Examples

~~~javascript
var fs = require('fs'),
    Chef = require('chef');

fs.readFile('/path/tp/pem.file', function (err, key) {
    var client = new Chef('mal', key, 'http://chef.server.com:4000');

    client.get('/nodes', function(err, res) {
        console.log(err ? err : res);
    });
});
~~~

### Methods

The `Chef` object supports `get`, `post`, `put`, `delete` and `update` methods and
accepts relative and absolute URLs (so you can use URLs returned in responses).
