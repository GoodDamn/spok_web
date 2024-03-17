var http = require('http');

console.log("created");

http.createServer(function (req, res) {

    res.writeHead(
        200,
        { 'Content-Type': 'application/json' }
    );

    res.end(
        JSON.stringify({
            parent: "Hello world!"
        })
    );
}).listen(8080);
