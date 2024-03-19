let http = require('http');
let fs = require('fs');
let config = require('./apis/config');

let htmlPay = fs.readFileSync(
    "./res/pay.html"
);

let meditatePng = fs.readFileSync(
    "./res/meditate.png"
);

console.log("created");

/*config.database.set(
    config.refUsers, {
        shit: "asdasdasdsad",
        shit2: "adasdsadsadasdsa"
});*/

let router = new Map();

router.set("/pay", (res, url) => {
    resHtml(res, htmlPay);
})

router.set("/createOrder", (res, url) => {
    let params = url.searchParams;
    let userId = params.get('id');

    config.createPayment(userId,(_, confirm_url) => {
        res.writeHead(302, {
            'Location': confirm_url
        });
        res.end();
    });
});

router.set("/meditate.png", (res, _) => {
    res.write(meditatePng);
    res.end();
})

http.createServer(function (req, res) {

    let url = new URL(
        "http://s.c" + req.url
    );

    console.log(url.pathname);

    let node = router.get(
        url.pathname
    );

    if (node == undefined) {
        resText(res, "Hello");
        return;
    }

    node(res, url);
    
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