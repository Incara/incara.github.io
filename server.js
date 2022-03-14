const https = require('https');
const fs = require('fs');
var path = require('path');

const options = {
    key: fs.readFileSync('./resources/certs/RootCA.key'),
    cert: fs.readFileSync('./resources/certs/RootCA.pem')
};

https.createServer(options, function(request, response) {

    var filePath = '.' + request.url;
    if (filePath === './') {
        filePath = './shark-fin.html';
    }

    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
        case '.patt':
            contentType = 'text/plaintext';
            break;
    }
    fs.readFile(filePath, function(err, html) {
        if (err) {
            response.writeHead(400, {'Content-type':'text/html'})
            console.log(err);
        }
        else {
            response.writeHeader(200, {"Content-Type": "text/html"});
            response.write(html);
            response.end();
        }
    });
}).listen(8085);