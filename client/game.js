const BOARD_SIZE = 18;
const SERVER = "http://localhost:8080";
const LS_USER = "user_name";
const CHAT_LOG_SIZE = 7;
let clickable=true;
let chatLogCounter = 0;

function paintStone(pos, color) {
    const piece = document.querySelector("#"+pos);
    piece.classList.add(color === 0 ? "black-stone" : "white-stone");
}

function onPieceClick(pos) {
    if(clickable === false)
        return;
    const piece = document.querySelector(`#${pos}`);
    if(piece.classList.contains("white-stone") || piece.classList.contains("black-stone"))
        return;

    console.log(`data send ${pos}`);

    const message = {"type": "pos", "data": pos, "sender": ID};
    ws.send(JSON.stringify(message));
}

function init() {
    const board = document.querySelector(".js-board");
    for(let i=1; i<=BOARD_SIZE; ++i) {
        for(let j=1; j<=BOARD_SIZE; ++j) {
            let newArea = document.createElement("div");
            newArea.classList.add("piece");
            newArea.id = `p${i}-${j}`;
            newArea.addEventListener('click', () => {
                onPieceClick(newArea.id);
            });
            board.appendChild(newArea);
        }
        board.appendChild(document.createElement("br"));
    }

    window.onbeforeunload = function(event) {
        event.preventDefault();
        const message = incodeMsg({type: "out", sender: ID});
        localStorage.removeItem(LS_USER);
        ws.send(message);
        ws.close();
    }

    window.addEventListener('keypress', function(event) {
        if(event.code === "Enter") {
            event.preventDefault();
            const chatbox = document.querySelector(".js-chatbox");
            const content = chatbox.value.trim();
            if(content !== "") {
                const message = incodeMsg({type: "chat", data: content, sender: ID});
                ws.send(message);              
            }
            chatbox.value = "";
        }
    });
}

const SOCK_SERVER = "ws://localhost:3000"
const ID = localStorage.getItem("user_name");
const ws = new WebSocket(SOCK_SERVER);
let COLOR;

function incodeMsg(message) {
    return JSON.stringify(message);
}

function decodeMsg(message) {
    return JSON.parse(message);
}

ws.onopen = function(event) {
    const message = incodeMsg({ "type": "connection", "sender": ID });
    ws.send(message);
}

ws.onmessage = function(event) {
    const message = decodeMsg(event.data);
    const info = document.querySelector(".js-info");

    switch(message.type) {
        case "connection":
            COLOR = message.data;
            const colorInfo = document.querySelector(".js-color");
            colorInfo.innerHTML = COLOR === 0 ? "흑" : "백";
            console.log(COLOR);
            if(COLOR === 0) {
                clickable = true;
                info.innerHTML = "당신 차례입니다!";
            } else {
                clickable = false;
                info.innerHTML = "상대가 두고 있습니다..";
            }
            break;

        case "pos":
            const pos = message.data;
            const color = message.color;
            paintStone(pos, color);
            if(message.color !== COLOR) {
                clickable = true;
                info.innerHTML = "당신 차례입니다!";
            } else {
                clickable = false;
                info.innerHTML = "상대가 두고 있습니다..";
            }
            break;
        
        case "end":
            if(COLOR === message.data)
                alert("당신이 이겼습니다!!");
            else
                alert("당신이 졌습니다 ㅠㅠ");
            
            ws.close();
            location.href=SERVER;
            break;
        
        case "out":
            alert("상대가 나갔습니다.");
            ws.close();
            location.href=SERVER;
            break;
        
        case "chat":
            if(chatLogCounter === 0) {
                const chatlog = document.querySelector("#chatlog1");
                if(message.sender === ID) {
                    chatlog.innerHTML = "나 : " + message.data;
                } else {
                    chatlog.innerHTML = "상대 : " + message.data;
                }
            } else {
                for(let i=chatLogCounter === 7 ? 6 : chatLogCounter; i>=1; --i) {
                    const upchat = document.querySelector(`#chatlog${i+1}`);
                    const downchat = document.querySelector(`#chatlog${i}`);
                    console.log(`upchat : ${upchat.innerHTML}`);
                    console.log(`downchat : ${downchat.innerHTML}`);
                    upchat.innerHTML = downchat.innerHTML;
                }

                const chatlog = document.querySelector("#chatlog1");
                if(message.sender === ID) {
                    chatlog.innerHTML = "나 : " + message.data;
                } else {
                    chatlog.innerHTML = "상대 : " + message.data;
                }
            }
            if(chatLogCounter !== 7)
                ++chatLogCounter;
            
            break;

        case "time":

            const time = message.data;
            const timeInfo = document.querySelector(".js-time");
            console.log(time);
            if(time === 0) {
                timeInfo.innerHTML = "시간초과!";
                const turnInfo = document.querySelector(".js-info");
                
                if(clickable) {
                    turnInfo.innerHTML = "상대가 두고 있습니다..";
                    clickable = false;
                } else {
                    turnInfo.innerHTML = "당신 차례입니다!";
                    clickable = true;
                }
            } else {
                timeInfo.innerHTML = time + " 초 남았습니다!";
            }
            
            break;
    }
}

ws.onerror = function(event) {
    console.log(`Error : ${event.data}`);
}


init();

