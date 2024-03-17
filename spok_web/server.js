let http = require('http');
let fs = require('fs');

let htmlPay = fs.readFileSync(
    "./res/pay.html"
);

console.log("created");

http.createServer(function (req, res) {

    if (req.url === "/pay") {
        resHtml(res, htmlPay);
        return;
    }

    res.writeHead(
        200,
        { 'Content-Type': 'text/plain' }
    );

    res.write("Hello");

    res.end();
    
}).listen(8080);


function resHtml(res, html) {
    res.writeHead(
        200,
        { 'Content-Type': 'text/html' }
    );

    res.write(html);

    res.end();
}