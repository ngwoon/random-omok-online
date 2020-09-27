const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const match = require("./match.js");
const inGame = require("./in_game.js");
const Board = require("./board.js");
const cookie = require('cookie');
const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({port:3000});

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
    'GET/': indexHandler,
    'GET/resource': resourceHandler,
    'GET/check': checkHandler,
    'GET/ready': indexHandler,
    'GET/game': indexHandler,
    'GET/out': outHandler,
    'default': noResponse
};

function outHandler(request, response) {
    const userName = cookie.parse(request.headers.cookie).user_name;
    inGame.exitPlayers.push(userName);
}

function checkHandler(request, response) {
    const cookies = cookie.parse(request.headers.cookie);
    const userName = cookies.user_name;
    match.waitings[userName] = response;
    match.matching.emit("wait");
}

function indexHandler(request, response) {

    const current_cookie = request.headers.cookie;
    if(current_cookie !== undefined) {
        const userName = cookie.parse(current_cookie).user_name;
        if(inGame.boardTable[userName] !== undefined) {
            const data = fs.readFileSync("./already_in_game.html");
            response.writeHead(200, {"Content-Type": "text/html"});
            response.end(data);
            return;
        }
    }

    const parsedUrl = url.parse(request.url);
    let resource = parsedUrl.pathname.substr(1);

    if(resource === "")
        resource = "index";
    
    resource = `../client/${resource}.html`;

    fs.readFile(resource, "utf-8", function(error, data) {
        if(error) {
            console.log(`page read error : ${error}`);
            noResponse(req, res);
        }
        else {

            if(cookie === undefined) {
                const userName = match.genUserNum(USER_LIMIT);
                inGame.invalidUserName.push(userName);
                console.log("invalidUserName");
                console.log(inGame.invalidUserName);
                response.writeHead(200, {
                    "Content-Type": "text/html",
                    "Set-Cookie": [`user_name=${userName}`],
                    "httpOnly": true
                });
                match.waitings[userName] = null;
            } else
                response.writeHead(200, {"Content-Type": "text/html"});

            response.end(data);
        }
    });
}
function noResponse(request, response) {
    fs.readFile("./404.html", "utf-8", function(error, data) {
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
            const res = fs.readFileSync(".."+parsedUrl.pathname, "utf-8");
            response.writeHead(200, {"Content-Type": mimeTypes[parsedResource.ext]});
            response.end(res);
        } catch (error){
            console.log(`server error : ${error}`);
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

function decodeMsg(message) {
    return JSON.parse(message);
}

function incodeMsg(message) {
    return JSON.stringify(message);
}

wss.on("connection", function(ws) {
    ws.on("message", function(message) {

        const msg = decodeMsg(message);

        let userName = msg.sender;
        switch(msg.type) {
            case "connection":
                console.log("connection message!!");

                const counter = match.readyPlayers[userName];

                // 상대방이 ready 도중에 나갔다면
                const eidx = inGame.exitPlayers.indexOf(counter);
                if(eidx != -1) {
                    inGame.exitPlayers.splice(eidx, 1);
                    const msg = incodeMsg({type: "out"});
                    ws.send(msg);
                    ws.close();
                    return;
                }

                if(inGame.clientWs[counter] !== undefined) {

                    const board = new Board(userName, ws, counter, inGame.clientWs[counter]);

                    inGame.boardTable[userName] = board;
                    inGame.boardTable[counter] = board;

                    delete match.readyPlayers[userName];
                    delete match.readyPlayers[counter];

                    const msgToP1 = incodeMsg({"type": "connection", "data": board.pidx[userName]});
                    const msgToP2 = incodeMsg({"type": "connection", "data": board.pidx[counter]});

                    ws.send(msgToP1);
                    inGame.clientWs[counter].send(msgToP2);

                    delete inGame.clientWs[counter];
                }
                else
                    inGame.clientWs[userName] = ws;

                break;

            case "pos": {
                const pos = msg.data.substr(1).split("-");
                
                const board = inGame.boardTable[userName];
                
                const isOver = board.judge(pos[0], pos[1], board.pidx[userName]);

                const userWs = board.pws[userName];
                const counterWs = board.pws[board.pname[board.pidx[userName]^1]];

                board.turn ^= 1;

                let msgToSend = incodeMsg({"type": "pos", "data": msg.data, "color": board.pidx[userName]});

                userWs.send(msgToSend);
                counterWs.send(msgToSend);

                if(isOver) {
                    const counter = board.pname[board.pidx[userName]^1];

                    msgToSend = incodeMsg({"type": "end", "data": board.pidx[userName]});
                    ws.send(msgToSend);
                    counterWs.send(msgToSend);

                    ws.close();
                    counterWs.close();

                    delete inGame.boardTable[userName];
                    delete inGame.boardTable[counter];
                }
            }
            break;

            case "out": {
                console.log("out message recieved");
                const board = inGame.boardTable[userName];
                const counter = board.pname[board.pidx[userName]^1];
                const userWs = board.pws[userName];
                const counterWs = board.pws[counter];
                
                const msg = incodeMsg({type: "out"});
                counterWs.send(msg);

                userWs.close();
                counterWs.close();

                delete inGame.boardTable[userName];
                delete inGame.boardTable[counter];
            }
            break;
        }
    });
});

server.listen(8080, function() {
    console.log("Server is running...");
})