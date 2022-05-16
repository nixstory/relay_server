var express = require('express'),
    request = require('request'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    setCookie = require('set-cookie-parser'),
    cookieParser = require('cookie-parser')
// cookie = require('cookie');
app = express();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// var myLimit = typeof (process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
// console.log('Using limit: ', myLimit);
var jsessionid = '';

function getSessionId(response) {
    // const cookies = setCookie.parse(response.headers['set-cookie'], {
    //     decodeValues: true,
    //     map: true,
    // });
    // return cookies['JSESSIONID'] && cookies['JSESSIONID']['value'];
    if (response.headers != undefined) {
        const cookies = setCookie.parse(response.headers['set-cookie'], {
            decodeValues: true,
            map: true,
        });
        return cookies['JSESSIONID'] && cookies['JSESSIONID']['value'];
    } else {
        return "";
    }
}

// app.use(bodyParser.json({ limit: myLimit }));
app.use(bodyParser.json(session({
    httpOnly: true,	//자바스크립트를 통해 세션 쿠키를 사용할 수 없도록 함
    // secure: ture,	//https 환경에서만 session 정보를 주고받도록처리
    // secret: 'secret key',	//암호화하는 데 쓰일 키
    resave: true,	//세션을 언제나 저장할지 설정함
    saveUninitialized: true,	//세션이 저장되기 전 uninitialized 상태로 미리 만들어 저장
    cookie: {	//세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
        httpOnly: true,
        Secure: true,
        value: true
    }
})));
app.use(cookieParser());

app.all('*', function (req, res, next) {
    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
    // req.header('set-cookie', cookies);

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

        request({ url: targetURL, method: req.method, json: req.body, headers: { 'cookie': 'JSESSIONID=' + jsessionid }, },
            function (error, response, body) {
                // var cookies = response.headers['set-cookie'];

                if (error) {
                    console.error('error: ' + error)
                } else {
                    console.log(">>>>>>>>>> [RESPONSE/HEAD] : " + JSON.stringify(body.dataHeader, null, 4));
                    console.log(">>>>>>>>>> [RESPONSE/BODY] : " + JSON.stringify(body.dataBody, null, 4));
                }

                var _jsessionid = getSessionId(response);
                if (_jsessionid != undefined) {
                    jsessionid = _jsessionid;
                    // var cookies = response.headers['set-cookie'];
                    console.log('jsessionid : ' + jsessionid);
                }
            }).pipe(res);
    }
});

app.set('port', process.env.PORT || 4000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});