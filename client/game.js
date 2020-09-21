const BOARD_SIZE = 18;
let board = new Array(BOARD_SIZE);
let flag = 0;

function omok() {
    this.map = document.getElementById("board");
}

omok.prototype.pieceListener = function(event) {
    if(event.target.className === "piece") {
        let pos = event.target.id.split(' ');
        board[pos[0]*1][pos[1]*1] = flag;

        if(flag === 1)
            event.target.className = "white-stone";
        else
            event.target.className = "black-stone";

        omok.prototype.check(pos[0]*1, pos[1]*1, flag);
        flag = flag ^ 1;
    }
}

omok.prototype.init = function() {
    console.log("init!");
    for(let i=0; i<BOARD_SIZE; ++i)
        board[i] = new Array(BOARD_SIZE);
    
    for(let i=0; i<BOARD_SIZE; ++i) {
        for(let j=0; j<BOARD_SIZE; ++j) {
            board[i][j] = -1;
        } 
    }
    
    for(let i=0; i<BOARD_SIZE; ++i) {
        for(let j=0; j<BOARD_SIZE; ++j) {
            let newArea = document.createElement("div");
            newArea.classList.add("piece");
            newArea.id = i+" "+j;
            newArea.addEventListener('click', omok.prototype.pieceListener);
            this.map.appendChild(newArea);
        }
        let br = document.createElement("br");
        this.map.appendChild(br);
    }
}
omok.prototype.gameOver = function(stone) {
    if(stone === 0) {
        alert("흑돌 승!");
    } else if(stone === 1) {
        alert("백돌 승!");
    }
    location.reload(true);
}
omok.prototype.check = function(_y, _x, stone) {
    let x = _x, y = _y;
    let count=0;

    while(board[_y][x-1] == stone && x > 0)
        --x;
    while(board[_y][x++] == stone && x <= BOARD_SIZE)
        ++count;
    if(count == 5)
        omok.prototype.gameOver(stone);

    console.log("가로 측정 결과 : " + count);

    x = _x; y = _y;
    count = 0;
    while(board[y-1][_x] == stone && y > 0) 
        --y;
    while(board[y++][_x] == stone && y <= BOARD_SIZE)
        ++count;
    if(count == 5)
        omok.prototype.gameOver(stone);

    console.log("세로 측정 결과 : " + count);

    x = _x; y = _y;
    count = 0;
    while(board[y-1][x-1] == stone && x > 0 && y > 0) {
        --x; --y;
    }
    while(board[y++][x++] == stone && x <= BOARD_SIZE && y <= BOARD_SIZE)
        ++count;
    if(count == 5)
        omok.prototype.gameOver(stone);

    console.log("대각선 좌하우상 측정 결과 : " + count);

    x = _x; y = _y;
    count = 0;
    while(board[y-1][x+1] == stone && x < BOARD_SIZE && y > 0) {
        ++x; --y;
    }
    while(board[y++][x--] == stone && x >= 0 && y <= BOARD_SIZE)
        ++count;
    if(count == 5)
        omok.gameOver(stone);

    console.log("대각선 좌상우하 측정 결과 : " + count);
}

let newGame = new omok();
newGame.init();