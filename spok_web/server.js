let https = require('https');
let http = require('http');
let fs = require('fs');
let config = require('./apis/config');

let router = new Map();
let resourceMap = new Map();
loadResources(resourceMap, "./res");

console.log("Resources", resourceMap);

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

    console.log("http", url.host, url.pathname, req.method);

    let node = router.get(
        url.pathname
    );

    if (node == undefined) {
        resText(res, "Hello");
        return;
    }

    node(res, url);
}).listen(4443);

function loadResources(
    resourceMap,
    path
) {
    fs.readdirSync(path)
        .forEach((sub) => {
            console.log(path, sub);
            let ind = sub.indexOf(".");
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
                p
            );
            resourceMap.set(p, file);
            router.set(fileName.substring(0,ind+1), (res, url) => {
                res.end(resourceMap.get(p));
            });
            
        });
}

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
        { 'Content-Type': 'text/html; charset=utf-8;' }
    );
    res.end(html);
}