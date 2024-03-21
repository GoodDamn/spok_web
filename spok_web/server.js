let https = require('https');
let fs = require('fs');
let config = require('./apis/config');

let htmlPay = fs.readFileSync(
    "./res/html/pay.html"
);

let htmlTerms = fs.readFileSync(
    "./res/html/terms.html"
);

let htmlPolicy = fs.readFileSync(
    "./res/html/policy.html"
);

let htmlReturnPayment = fs.readFileSync(
    "./res/html/returnPayment.html"
);

let meditatePng = fs.readFileSync(
    "./res/img/meditate.png"
);

let favicon = fs.readFileSync(
    "./res/favicon.ico"
);

console.log("created");

let router = new Map();

router.set("/createOrder", (res, url) => {
    let params = url.searchParams;
    let userId = params.get('id');
    
    if (userId == undefined || userId.length < 15) {
        res.end();
        return;
    }

    config.createPayment(url.host, (orderId, confirm_url) => {

        config.setUserData(
            userId,{
                "pteid": orderId
            }
        );

        res.writeHead(302, {
            'Location': confirm_url
        });
        res.end();
    });
});

router.set("/pay", (res, url) => {
    resHtml(res, htmlPay);
})

router.set("/policy", (res, _) => {
    resHtml(res,htmlPolicy);
});

router.set("/terms", (res, _) => {
    resHtml(res,htmlTerms);
});

router.set("/returnPayment", (res, url) => {
    resHtml(res,htmlReturnPayment);
});

router.set("/img/meditate.png", (res, _) => {
    res.end(meditatePng);
})

router.set("/favicon.ico", (res, _) => {
    res.end(favicon);
});

http.createServer(function (req, res) {

    let url = new URL(
        "http://"+req.rawHeaders[1] + req.url
    );

    console.log(url.host, url.pathname);

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
    res.end(text);
}

function resHtml(res, html) {
    res.writeHead(
        200,
        { 'Content-Type': 'text/html; charset=UTF-8;' }
    );
    res.end(html);
}