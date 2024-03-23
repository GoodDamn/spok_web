let https = require('https');
let http = require('http');
let fs = require('fs');
let config = require('./apis/config');
const { url } = require('inspector');

let router = new Map();
let resourceMap = new Map();
let date = new Date();

loadResources(resourceMap, "");

let ssl = {
    key: fs.readFileSync(
        "./ssl/key"
    ),
    cert: fs.readFileSync(
        "./ssl/cert"
    )
};

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
    router.get("/pay.html")(res, url);
});

router.set("/paymentInfo", (res, url) => {
    router.get("/paymentInfo.html")(res, url);
});

http.createServer(function (req, res) {
    res.writeHead(301, {
        'Location': 'https://' + req.rawHeaders[1] + req.url
    });
    res.end();
}).listen(8080);

https.createServer(ssl, function (req, res) {
    let url = new URL(
        "http://" + req.rawHeaders[1] + req.url
    );
    date.setTime(Date.now());
    console.log("\n\nhttps", req.method, url.host, url.pathname);
    console.log("IP:", req.socket.remoteAddress);
    console.log(
        "DATE REQ:",
        date.toLocaleDateString(),
        date.toLocaleTimeString()
    );

    let node = router.get(
        url.pathname
    );

    if (node == undefined) {
        router.get("/pay.html")(res, url);
        return;
    }

    node(res, url);
}).listen(4443);

function loadResources(
    resourceMap,
    path
) {
    fs.readdirSync("res"+path)
        .forEach((sub) => {
            let ind = sub.lastIndexOf(".");
            if (ind == -1) {
                loadResources(
                    resourceMap,
                    path + `/${sub}`
                );
                return;
            }

            let fileName = `/${sub}`;
            let p = path + fileName;
            let file = fs.readFileSync(
                "res"+p
            );
            resourceMap.set(p, file);

            console.log(p);

            router.set(p, (res, url) => {
                res.writeHead(200, {
                    'Content-Type': mimeType(sub)
                });
                res.end(resourceMap.get(p));
            });
            
        });
}

function mimeType(fileName) {

    if (fileName.includes("html")) {
        return 'text/html';
    }

    return '';
}