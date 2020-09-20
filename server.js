const http = require("http");
const url = require("url");
const path = require("path");
const fs = require('fs');
const queryString = require("querystring");

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

const server = http.createServer(function(request, response) {
    const parsedUrl = url.parse(request.url);
    let resource = parsedUrl.pathname.substr(1);

    // 요청한 html 파일에서 css, 혹은 js 파일을 요구할 경우
    const extName = path.extname(resource);
    console.log(extName);
    if(extName) {
        const parsedResource = path.parse(resource);
        try {
            const res = fs.readFileSync("."+parsedUrl.pathname, "utf-8");
            console.log(res);
            response.writeHead(200, {"Content-Type": mimeTypes[parsedResource.ext]});
            response.end(res);
        } catch (error){
            console.log(error);
            response.writeHead(500, {"Content-Type": "text"});
            response.end(fs.readFileSync("./server_error_page.html", "utf-8"));
        }
    } else {
        if(resource === "")
            resource = "index";
        
        resource = `./client/${resource}.html`;

        fs.readFile(resource, "utf-8", function(error, data) {
            console.log(error);
            if(error) {
                fs.readFile("./client/404.html", "utf-8", function(error, data) {
                    response.writeHead(404, {"Content-Type": "text/html"});
                    response.end(data);
                });
            } else {
                response.writeHead(200, {"Content-Type": "text/html"});
                response.end(data);
            }
        });
    }
});

server.listen(8080, function() {
    console.log("Server is running...");
})