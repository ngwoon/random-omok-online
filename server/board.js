const BOARD_SIZE = 18;

function Board(p1name, p1ws, p2name, p2ws) {
    this.pws = {};
    this.pws[p1name] = p1ws;
    this.pws[p2name] = p2ws;

    this.pidx = {};
    this.pidx[p1name] = 0;
    this.pidx[p2name] = 1;
    
    this.pname = [p1name, p2name];

    this.board = new Array(BOARD_SIZE+2).fill(null).map(()=>Array(BOARD_SIZE+2).fill(-1));

    this.judge = function(_y, _x, stone) {
        _y = parseInt(_y);
        _x = parseInt(_x);
        this.board[_y][_x] = stone;
        
        let x = _x, y = _y;
        let count=0;
    
        while(this.board[_y][x-1] === stone && x > 0)
            --x;
        while(this.board[_y][x++] === stone && x <= BOARD_SIZE)
            ++count;

        if(count === 5)
            return true;
    
        x = _x; y = _y;
        count = 0;
        while(this.board[y-1][_x] === stone && y > 0) 
            --y;
        while(this.board[y++][_x] === stone && y <= BOARD_SIZE)
            ++count;

        if(count === 5)
            return true;
    
        x = _x; y = _y;
        count = 0;
        while(this.board[y-1][x-1] === stone && x > 0 && y > 0) {
            --x; --y;
        }
        while(this.board[y++][x++] === stone && x <= BOARD_SIZE && y <= BOARD_SIZE)
            ++count;

        if(count === 5)
            return true;

        x = _x; y = _y;
        count = 0;
        while(this.board[y-1][x+1] === stone && x < BOARD_SIZE && y > 0) {
            ++x; --y;
        }
        while(this.board[y++][x--] === stone && x >= 0 && y <= BOARD_SIZE)
            ++count;

        if(count === 5)
            return true;
    
        return false;
    }

    this.time = 10;
    this.checkTime = null;
    this.currentTimeout = null;
}

module.exports = Board;