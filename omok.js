const EventEmitter = require('events');

exports.waitings = {};
exports.inGame = {};
exports.matching = new EventEmitter();
exports.matching.on("wait", function(userName) {
    const matchPlayers = {};
    if(Object.keys(exports.waitings).length >= 2) {
        console.log(Object.keys(exports.waitings));
        for(key in exports.waitings) {
            if(exports.waitings[key] !== null)
                matchPlayers[key] = exports.waitings[key];
            if(Object.keys(matchPlayers).length == 2)  
                break;
        }

        if(Object.keys(matchPlayers).length == 2) {
            for(key in matchPlayers) {
                delete exports.waitings[key];
                matchPlayers[key].writeHead(200);
                matchPlayers[key].end();
            }
        }
    }
});

// exports.matching.on("find", function(userName, response, idx) {
//     exports.waitings.splice(idx, 1);
//     idx = exports.waitings.indexOf(userName);
//     exports.waitings.splice(idx, 1);

//     response.writeHead(200, {"Content-Type": "text"});
//     response.end("연결 성공!!");
// })

exports.genUserNum = function(LIMIT) {
    let isExist = true;
    let newUser;
    while(isExist) {
        newUser = parseInt(Math.random()*10000000) % LIMIT;
        let existCheck=false;
        for(key in exports.waitings) {
            if(exports.waitings.key === newUser) {
                existCheck = true;
                break;
            }
        }
        if(!existCheck)
            isExist=false;
    }
    return newUser;
}
