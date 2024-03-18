let http = require('http');
let fs = require('fs');
let config = require('./apis/config');

let htmlPay = fs.readFileSync(
    "./spok_web/res/pay.html"
);

console.log("created");

/*config.database.set(
    config.refUsers, {
        shit: "asdasdasdsad",
        shit2: "adasdsadsadasdsa"
});*/

var router = new Map();

router.set("/pay", (res) => {
    resHtml(res, htmlPay);
})

router.set("/createOrder", (res) => {
    res.end("order");
    config.createPayment((_, confirm_url) => {
        res.writeHead(302, {
            'Location': confirm_url
        });
        res.end();
    });
});

http.createServer(function (req, res) {
    
    let node = router.get(
        req.url
    );

    console.log(req.url, node);

    if (node == undefined) {
        resText(res, "Hello");
        return;
    }

    node(res);
    
}).listen(8080);

function resText(res, text) {
    res.writeHead(
        200,
        { 'Content-Type': 'text/plain' }
    );

    res.write(text);

    res.end();
}

function resHtml(res, html) {
    res.writeHead(
        200,
        { 'Content-Type': 'text/html' }
    );

    res.write(html);

    res.end();
}