const GameBoard = function() {
    const rows = 3;
    const columns = 3;
    const board = []

    for (let i = 0; i < rows; i++) {
        board[i] = []

        for(let j = 0; j < columns; j++) {
            board[i].push(Cell())
        }
    }


    const getBoard = () => board

    const placeMark = (row, column, player) => { 
        board[row][column].addMark(player)
    }


    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.log(boardWithCellValues)
    }


    return { getBoard, printBoard, placeMark }
}


const Cell = function() {
    let value = " "


    const addMark = (player) => {
        value = player
    }


    const getValue = () => value

    return {
        addMark,
        getValue
    }
}


const GameController = function(playerOneName = "Player One", playerTwoName = "Player Two") {
    const board = GameBoard()

    const players = [{
        name: playerOneName,
        marker: "X"
    },
    {
        name: playerTwoName,
        marker: "O"
    }]

    let activePlayer = players[0]


    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]
    }


    const getActivePlayer = () => activePlayer


    const printNewRound = () => {
        board.printBoard()
        console.log(`${getActivePlayer().name}'s turn.`)
    }

    const isCellEmpty = (row, column) => {
        return board.getBoard()[row][column].getValue() === " "
    }


    const playRound = (row, column) => {
        if (isCellEmpty(row, column)) {
            console.log(`${getActivePlayer().name} mark row ${row}, column ${column}, with ${getActivePlayer().marker}`)
            board.placeMark(row, column, getActivePlayer().marker)
            switchPlayerTurn()
            printNewRound()
        } else {
            console.log("The cell is already marked, choose another one")
            printNewRound()
        }

    }

    printNewRound()


    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard
    }

}


const game = GameController()




