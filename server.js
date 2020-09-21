const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const omok = require("./omok.js");
const cookie = require('cookie');

const USER_LIMIT = 10000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const router = {
    'GET/check': checkHandler,
    'GET/': indexHandler,
    'GET/resource': resourceHandler,
    'default': noResponse
};

function checkHandler(request, response) {
    const cookies = cookie.parse(request.headers.cookie);
    console.log(request.headers.cookie, cookies.user_name);
    const userName = cookies.user_name;
    omok.waitings[userName] = response;
    omok.matching.emit("wait", userName);
}

function indexHandler(request, response) {
    let cookies = null;
    if(request.headers.cookie !== undefined)
        cookies = "Cookie Exists";
    
    const parsedUrl = url.parse(request.url);
    let resource = parsedUrl.pathname.substr(1);

    if(resource === "")
        resource = "index";
        
    resource = `./client/${resource}.html`;

    fs.readFile(resource, "utf-8", function(error, data) {
        if(error) {
            console.log(`page read error : ${error}`);
            noResponse(req, res);
        }
        else {
            if(cookies !== null) {
                response.writeHead(200, {"Content-Type": "text/html"});
            }
            else {
                const userName = omok.genUserNum(USER_LIMIT);
                console.log(userName);
                response.writeHead(200, {
                    "Content-Type": "text/html",
                    "Set-Cookie": [`user_name=${userName}`],
                    "httpOnly": true
                });
                omok.waitings[userName] = null;
            }
            response.end(data);
        }
    });
}
function noResponse(request, response) {
    fs.readFile("./client/404.html", "utf-8", function(error, data) {
        response.writeHead(404, {"Content-Type": "text/html"});
        response.end(data);
    });
}
function resourceHandler(request, response) {
    const parsedUrl = url.parse(request.url);
    let resource = parsedUrl.pathname.substr(1);
    
    const extName = path.extname(resource);
    if(extName) {
        const parsedResource = path.parse(resource);
        try {
            const res = fs.readFileSync("."+parsedUrl.pathname, "utf-8");
            response.writeHead(200, {"Content-Type": mimeTypes[parsedResource.ext]});
            response.end(res);
        } catch (error){
            console.log(error);
            response.writeHead(500, {"Content-Type": "text"});
            response.end(fs.readFileSync("./server_error_page.html", "utf-8"));
        }
    }
}

const server = http.createServer(function(request, response) {
    const parsedUrl = url.parse(request.url);
    const parsedUrlByPath = path.parse(request.url);
    if(parsedUrlByPath.ext)
        parsedUrl.pathname = "/resource";
    
    console.log(request.method + parsedUrl.pathname);
    const redirectedFunc = router[request.method + parsedUrl.pathname] || router["default"];
    redirectedFunc(request, response);
});

server.listen(8080, function() {
    console.log("Server is running...");
})