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
        console.table(boardWithCellValues)
    }


    return { getBoard, printBoard, placeMark }
}


const Cell = function() {
    let value = null


    const addMark = (player) => {
        value = player
    }

    const resetValue = () => {
        value = null
    }


    const getValue = () => value

    return {
        addMark,
        getValue,
        resetValue
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
        marker: "O",
        computer: true
    },]


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
        return board.getBoard()[row][column].getValue() === null
    }


    const checkWin = () => {
        const activeMarker = getActivePlayer().marker;
        const boardFormat = board.getBoard().map((row) => row.map((cell) => cell.getValue()));
    
        // Check horizontal wins
        for (let row of boardFormat) {
            if (row.every(val => val === activeMarker)) {
                return true // Win found
            }
        }
    
        // Check vertical wins
        for (let col = 0; col < boardFormat[0].length; col++) {
            if (boardFormat.every(row => row[col] === activeMarker)) {
                return true // Win found
            }
        }
    
        // Check diagonal wins
        if (boardFormat.every((row, index) => row[index] === activeMarker)) {
            return true // Top-left to bottom-right
        }
        if (boardFormat.every((row, index) => row[boardFormat.length - 1 - index] === activeMarker)) {
            return true // Top-right to bottom-left
        }

        // check draw
        const isDraw = boardFormat.every(array => !array.includes(null))

        if (isDraw) {
            return "Draw"
        }
    
        return false // No win found
    };


    const computerMove = (gameBoard) => {
        let emptyCells = []

        gameBoard.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                if (cell.getValue() === null) {
                    emptyCells.push([rowIndex, columnIndex])
                }
            })
        })
        console.log(emptyCells.length)

        console.log(players)

        
        const randomMove = Math.floor(Math.random() * emptyCells.length)

        board.placeMark(...emptyCells[randomMove], getActivePlayer().marker)

        console.log(...emptyCells[randomMove], emptyCells)
    }
    

    const resetGame = () => {
        board.getBoard().forEach(row => {
        row.forEach(cell => {
            cell.resetValue()
        })
      })


      activePlayer = players[0]
      board.printBoard()
    }



    const playRound = (row, column) => {
        if (isCellEmpty(row, column)) {
            console.log(`${getActivePlayer().name} marks row ${row}, column ${column}, with ${getActivePlayer().marker}`);

            board.placeMark(row, column, getActivePlayer().marker);

            const roundResult = checkWin(board.getBoard())
            
            if (roundResult === "Draw") {
                console.log("It's a draw!")
                board.printBoard()
            } else if (roundResult) {
                console.log(`${getActivePlayer().name} wins!`);
                board.printBoard()
            } else if (players[1].computer) {
                console.log("Computer's turn")
                switchPlayerTurn();
                computerMove(board.getBoard())
                switchPlayerTurn();
                printNewRound()
            } else {
                console.log(players)
                switchPlayerTurn();
                printNewRound();
                console.log("No winner yet.");
            }
        } else {
            console.log("The cell is already marked, choose another one");
            printNewRound();
        }
    };
    
    printNewRound()

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard,
        resetGame
    }
}

const game = GameController("Tuan", "Hoang");





