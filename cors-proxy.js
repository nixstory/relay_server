var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var myLimit = typeof (process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({ limit: myLimit }));

app.all('*', function (req, res, next) {
    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        var targetURL = req.header('Target-URL'); // Target-URL ie. https://example.com or http://example.com

        console.log(">>>>>>>>>> [TRXCD] : " + req.body.dataHeader.trxCd);
        console.log(">>>>>>>>>> [REQUEST/HEAD] : " + JSON.stringify(req.body.dataHeader, null, 4));
        console.log(">>>>>>>>>> [REQUEST/BODY] : " + JSON.stringify(req.body.dataBody, null, 4));

        if (!targetURL) {
            res.send(500, { error: 'There is no Target-Endpoint header in the request' });
            return;
        }
        request({ url: targetURL, method: req.method, json: req.body, headers: { 'Authorization': req.header('Authorization') }, },
            function (error, response, body) {
                if (error) {
                    console.error('error: ' + error)
                } else {
                    console.log(">>>>>>>>>> [RESPONSE/HEAD] : " + JSON.stringify(body.dataHeader, null, 4));
                    console.log(">>>>>>>>>> [RESPONSE/BODY] : " + JSON.stringify(body.dataBody, null, 4));
                }
            }).pipe(res);
    }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});