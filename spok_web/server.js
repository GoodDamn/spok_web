let http = require('http');
let fs = require('fs');
let config = require('./apis/config');

let htmlPay = fs.readFileSync(
    "./res/pay.html"
);

console.log("created");

/*config.database.set(
    config.refUsers, {
        shit: "asdasdasdsad",
        shit2: "adasdsadsadasdsa"
});*/

http.createServer(function (req, res) {

    if (req.url === "/pay") {
        resHtml(res, htmlPay);
        return;
    }

    if (req.url === "/createOrder") {
        config.createPayment((paymentRes) => {
            res.end(JSON.stringify(paymentRes.data));
        });
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