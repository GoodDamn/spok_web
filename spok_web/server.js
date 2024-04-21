let https = require('https');
let http = require('http');
let fs = require('fs');
let config = require('./apis/config');

class URL {
    path;
    params;
    host;
};

let router = new Map();
let resourceMap = new Map();
let date = new Date();

loadResources(resourceMap, "");

let tls;
var secondSSL;
try {
    tls = require('node:tls');
    secondSSL = tls.createSecureContext({
        key: fs.readFileSync(
            "./www_ssl/key"
        ),
        cert: fs.readFileSync(
            "./www_ssl/cert"
        )
    });
} catch {
    console.log("TLS not supported");
}


let ssl = {
    key: fs.readFileSync(
        "./ssl/key"
    ),
    cert: fs.readFileSync(
        "./ssl/cert"
    )/*,
    SNICallback: function (domain, cb) {
        if (domain === 'domain') {
            cb(null, secondSSL);
        } else {
            cb();
        }
    }*/
};

router.set("/createOrder", (res, url) => {

    let userId = getUserIdParams(
        url
    );

    console.log("CREATE_ORDER:", userId);

    if (userId == null) {
        res.end("No user id");
        return;
    }

    config.getUserPaymentId(
        userId, (payId) => {
            console.log("CREATE_ORDER: USER_PAY_ID", payId);
            if (payId == null) { // No pay
                config.createPayment(url.host, "grigorydum@gmail.com", (orderId, confirm_url) => {
                    config.setUserData(
                        userId, {
                        "pteid": orderId
                    }, () => {
                        res.writeHead(302, {
                            'Location': confirm_url
                        });
                        res.end();
                    });
                });
                return;
            }

            config.checkPayment(
                payId, (payment) => {

                    if (payment['paid']) {
                        // Check sub validation for 31 days = 2678400 sec.

                        let isoDate = payment['created_at'];

                        let currentTime = Math.round(date.getTime() / 1000);
                        let createdTime = Math.round(Date.parse(isoDate) / 1000);

                        if (currentTime - createdTime < 2678400) {
                            // with premium
                            res.end();
                            return;
                        }

                        // premium expired

                        config.createPayment(url.host, "grigorydum@gmail.com" ,(orderId, confirm_url) => {
                            config.setUserData(
                                userId, {
                                "pteid": orderId
                            }, () => {
                                res.writeHead(302, {
                                    'Location': confirm_url
                                });
                                res.end();
                            });
                        });

                        return;
                    }

                    let status = payment['status'];

                    if (status === 'pending' || status === 'waiting_for_capture') {
                        res.writeHead(302, {
                            'Location': payment['confirmation']['confirmation_url']
                        });
                        res.end();
                        return;
                    }

                    config.createPayment(url.host, (orderId, confirm_url) => {
                        config.setUserData(
                            userId, {
                            "pteid": orderId
                        }, () => {
                            res.writeHead(302, {
                                'Location': confirm_url
                            });
                            res.end();
                        });
                    });
                });
        }
    )
});

router.set("/returnPayment", (res, url) => {
    router.get("/returnPayment.html")(res, url);
});

router.set("/policy", (res, url) => {
    router.get("/policy.html")(res, url);
});

router.set("/terms", (res, url) => {
    router.get("/terms.html")(res, url);
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

    let index = req.url
        .lastIndexOf("?");

    var url = new URL();

    url.host = req.rawHeaders[1];

    if (index != -1) {
        url.path = req.url.substring(
            0, index
        );

        url.params = req.url.substring(
            index + 1
        );
    } else {
        url.path = req.url;
        url.params = "";
    }

    
    date.setTime(Date.now());
    console.log(
        "\n\nhttps",
        req.method,
        url.host,
        url.path,
        url.params
    );

    console.log(
        "IP:",
        req.socket
            .remoteAddress
    );

    console.log(
        "DATE REQ:",
        date.toLocaleDateString(),
        date.toLocaleTimeString()
    );

    let node = router.get(
        url.path
    );

    if (node == undefined) {
        router.get("/pay.html")(res, url.path);
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

            router.set(p, (res, _) => {
                res.writeHead(200, {
                    'Content-Type': mimeType(sub)
                });
                res.end(resourceMap.get(p));
            });
            
        });
}

function getUserIdParams(
    url
) {
    let params = url.params;

    let indexId = params.lastIndexOf(
        "i="
    );

    var indexAmp = params.indexOf(
        "&"
    )

    if (indexId == -1) {
        return null;
    }

    if (indexAmp == -1) {
        indexAmp = params.length
    }

    let userId = params.substring(
        indexId + 3, indexAmp
    )

    if (userId.length < 15) {
        return null;
    }

    return userId;
}

function mimeType(fileName) {

    if (fileName.includes("html")) {
        return 'text/html';
    }

    return '';
}