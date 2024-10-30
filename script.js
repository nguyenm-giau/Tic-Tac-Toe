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
        return boardWithCellValues
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
        computer: false
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


    let gameActive = true;
    let winningCells = [];

    const getGameState = () => gameActive

    const checkWin = () => {
        const activeMarker = getActivePlayer().marker;
        const boardFormat = board.getBoard().map((row) => row.map((cell) => cell.getValue()));

        let isWin = false
    
        // Check horizontal wins
        for (let rowIndex = 0; rowIndex < boardFormat.length; rowIndex++) {
            if (boardFormat[rowIndex].every(val => val === activeMarker)) {
                isWin = true
                winningCells = boardFormat[rowIndex].map((_, colIndex) => [rowIndex, colIndex]);
            }
        }
    
        // Check vertical wins
        for (let col = 0; col < boardFormat[0].length; col++) {
            if (boardFormat.every(row => row[col] === activeMarker)) {
                isWin = true
                winningCells = boardFormat.map((_, rowIndex) => [rowIndex, col]);
            }
        }
    
        // Check diagonal wins
        if (boardFormat.every((row, index) => row[index] === activeMarker)) {
            isWin = true
            winningCells = boardFormat.map((_, index) => [index, index]);
        }

        
        if (boardFormat.every((row, index) => row[boardFormat.length - 1 - index] === activeMarker)) {
            isWin = true
            winningCells = boardFormat.map((_, index) => [index, boardFormat.length - 1 - index]);
        }

        // check draw
        const isDraw = boardFormat.every(array => !array.includes(null))

        if (isDraw) {
            gameActive = false
            return "Draw"
        } else if (isWin) {
            gameActive = false
            return {isWin}
        } else {
            return false // No win found
        }

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

        
        const randomMove = Math.floor(Math.random() * emptyCells.length)

        board.placeMark(...emptyCells[randomMove], getActivePlayer().marker)

    }
    

    const resetGame = () => {
        gameActive = true;

        board.getBoard().forEach(row => {
        row.forEach(cell => {
            cell.resetValue()
        })
      })

      winningCells = [];
      activePlayer = players[0]
      board.printBoard()
    }



    const playRound = (row, column) => {
        if (!gameActive) {
            return
        }


        if (isCellEmpty(row, column)) {
            board.placeMark(row, column, getActivePlayer().marker);

            const roundResult = checkWin(board.getBoard())
            console.log(roundResult)
            if (roundResult === "Draw") {
                board.printBoard()
            } else if (roundResult.isWin) {
                console.log(`${getActivePlayer().name} wins!`);

                board.printBoard()
            } else if (players[1].computer) {
                switchPlayerTurn();
                computerMove(board.getBoard())
                switchPlayerTurn();
                printNewRound()
            } else  {
                switchPlayerTurn();
                printNewRound();
            }
        } else {
            printNewRound();
        }
    };
    
    printNewRound()

    return {
        playRound,
        getActivePlayer,
        getBoard: board.getBoard,
        resetGame,
        getGameState,
        checkWin,
        getWinningCells: () => winningCells
    }
}



const GameScreenController = (() => {
    const game = GameController()
    const boardDiv = document.querySelector(".game-board")
    const playerTurnDiv = document.querySelector(".player-turn")
    const playerTurnMark = document.querySelector(".player-mark")
    const resetGameButton = document.querySelector(".reset-game")

    const updateScreen = () => {
        boardDiv.innerHTML = "";

        const board = game.getBoard()
        const activePlayer = game.getActivePlayer()
        const winningCells = game.getWinningCells()


        playerTurnDiv.textContent = `${activePlayer.name}'s turn: ${playerTurnMark.textContent = activePlayer.marker}`


        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement("button")

                cellButton.classList.add("cell")

                cellButton.dataset.row = rowIndex
                cellButton.dataset.column = columnIndex
                cellButton.textContent = cell.getValue()

                if (cell.getValue() === "X") {
                    cellButton.classList.add("player1");
                } else if (cell.getValue() === "O") {
                    cellButton.classList.add("player2");
                }

                winningCells.forEach(([winRow, winCol]) => {
                    if (winRow === rowIndex && winCol === columnIndex) {
                        cellButton.classList.add("winning-cell")
                    }  
                })

                boardDiv.appendChild(cellButton)
            })
        })
    }

    const clickHandlerBoard = (e) => {
        const selectedRow = e.target.dataset.row
        const selectedColumn = e.target.dataset.column

        if (!e.target.closest("button")) {
            return
        }

        if (game.getActivePlayer().marker === "X") {
            e.target.classList.add("player1")
        } else {
            e.target.classList.add("player2")
        }

        game.playRound(selectedRow, selectedColumn)
        updateScreen()

        
    }


    const resetGame = () => {
        game.resetGame()
        updateScreen()
    }

    const playerHighlight = (e) => {
        if (e.target.tagName !== "BUTTON") return;
        
        const activePlayer = game.getActivePlayer();


        if (e.target.textContent === "O" || e.target.textContent === "X" || game.getGameState() === false) {
            return
        } else {
            const activePlayerMarkSpan = document.createElement("span")
            activePlayerMarkSpan.textContent = activePlayer.marker
            activePlayerMarkSpan.classList.add("preview-mark")
            e.target.appendChild(activePlayerMarkSpan)
        }
        

    }
      
    const removeHighlight = (e) => {
        if (e.target.tagName !== "BUTTON") return;
        const previewMark = document.querySelector(".preview-mark")

        if (previewMark) {
            previewMark.remove()
        }
    }

    boardDiv.addEventListener("click", clickHandlerBoard)
    boardDiv.addEventListener("mouseover", playerHighlight)
    boardDiv.addEventListener("mouseout", removeHighlight)
    resetGameButton.addEventListener("click", resetGame)


    updateScreen()


})()
