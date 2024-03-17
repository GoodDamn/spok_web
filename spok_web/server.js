let http = require('http');
let fs = require('fs');

let htmlPay = fs.readFileSync(
    "./res/pay.html"
);

console.log("created");

http.createServer(function (req, res) {

    res.writeHead(
        200,
        { 'Content-Type': 'text/html' }
    );

    res.write(htmlPay);

    res.end();
}).listen(8080);
