const GameBoard = function() {
    const rows = 3
    const columns = 3
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


const GameController = function(playerOneName = "Player One", playerTwoName = "Player Two", playAgainstAI = false, userMark = "X") {
    const board = GameBoard()


    const aiMark = userMark === "X" ? "O" : "X"


    const players = [{
        name: playerOneName,
        marker: userMark,
    },
    {
        name: playAgainstAI ? "Computer" : playerTwoName,
        marker: aiMark,
        computer: playAgainstAI
    },]


    let activePlayer = players[0]
    let gameActive = true
    let winningCells = []


    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]
    }


    const getActivePlayer = () => activePlayer
    const getGameState = () => gameActive



    const isCellEmpty = (row, column) => {
        return board.getBoard()[row][column].getValue() === null
    }


    const checkWin = () => {
        const activeMarker = getActivePlayer().marker
        const boardFormat = board.getBoard().map((row) => row.map((cell) => cell.getValue()))

        let isWin = false
    
        // Check horizontal wins
        for (let rowIndex = 0; rowIndex < boardFormat.length; rowIndex++) {
            if (boardFormat[rowIndex].every(val => val === activeMarker)) {
                isWin = true
                winningCells = boardFormat[rowIndex].map((_, colIndex) => [rowIndex, colIndex])
            }
        }
    
        // Check vertical wins
        for (let col = 0; col < boardFormat[0].length; col++) {
            if (boardFormat.every(row => row[col] === activeMarker)) {
                isWin = true
                winningCells = boardFormat.map((_, rowIndex) => [rowIndex, col])
            }
        }
    
        // Check diagonal wins
        if (boardFormat.every((row, index) => row[index] === activeMarker)) {
            isWin = true
            winningCells = boardFormat.map((_, index) => [index, index])
        }

        
        if (boardFormat.every((row, index) => row[boardFormat.length - 1 - index] === activeMarker)) {
            isWin = true
            winningCells = boardFormat.map((_, index) => [index, boardFormat.length - 1 - index])
        }

        // check draw
        const isDraw = boardFormat.every(array => !array.includes(null))

        if (isWin) {
            gameActive = false
            return {isWin}
        } else if (isDraw) {
            gameActive = false
            return "Draw"
        } else {
            return false // No win found
        }

    }


   

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
        gameActive = true

        board.getBoard().forEach(row => {
        row.forEach(cell => {
            cell.resetValue()
        })
      })

      winningCells = []
      activePlayer = players[0]
      board.printBoard()
    }



    const playRound = (row, column) => {
        if (!gameActive) {
            return
        }


        if (isCellEmpty(row, column)) {
            board.placeMark(row, column, getActivePlayer().marker)

            const roundResult = checkWin(board.getBoard())

            if (roundResult.isWin) {
                document.querySelector(".player-turn").textContent = `${getActivePlayer().name} Win!`
                return
            } else if (roundResult === "Draw") {
                document.querySelector(".player-turn").textContent = "Draw!"
            } else if (players[1].computer) {
                switchPlayerTurn()
                computerMove(board.getBoard())
                
                
                const aiRoundResult = checkWin()

                if (aiRoundResult.isWin) {
                    document.querySelector(".player-turn").textContent = `${getActivePlayer().name} Win!`
                    return
                } else if (aiRoundResult === "Draw") {
                    document.querySelector(".player-turn").textContent = "Draw!"
                    return
                }

                // Switch back to user turn
                switchPlayerTurn()
            } else  {
                switchPlayerTurn()
            }
        }
    }
    

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
    let game = GameController()
    const boardDiv = document.querySelector(".game-board")
    const playerTurnDiv = document.querySelector(".player-turn")
    const playerTurnMark = document.querySelector(".player-mark")
    const resetGameButton = document.querySelector(".reset-game")
    const dialog = document.querySelector("dialog")

    const updateScreen = () => {
        boardDiv.innerHTML = ""

        const board = game.getBoard()
        const activePlayer = game.getActivePlayer()
        const winningCells = game.getWinningCells()


        if (game.getGameState()) {
            playerTurnMark.classList.add(`${activePlayer.marker}`)
            playerTurnDiv.textContent = `${activePlayer.name}'s turn: ${playerTurnMark.textContent = activePlayer.marker}`

        }


        board.forEach((row, rowIndex) => {
            row.forEach((cell, columnIndex) => {
                const cellButton = document.createElement("button")

                cellButton.classList.add("cell")

                cellButton.dataset.row = rowIndex
                cellButton.dataset.column = columnIndex
                cellButton.textContent = cell.getValue()

                if (cell.getValue() === "X") {
                    cellButton.classList.add("player1")
                } else if (cell.getValue() === "O") {
                    cellButton.classList.add("player2")
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
        if (e.target.tagName !== "BUTTON") return
        
        const activePlayer = game.getActivePlayer()


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
        if (e.target.tagName !== "BUTTON") return
        const previewMark = document.querySelector(".preview-mark")

        if (previewMark) {
            previewMark.remove()
        }
    }

    boardDiv.addEventListener("click", clickHandlerBoard)
    boardDiv.addEventListener("mouseover", playerHighlight)
    boardDiv.addEventListener("mouseout", removeHighlight)
    resetGameButton.addEventListener("click", resetGame)


    const modal = document.querySelector(".modal")
    const startButton = modal.querySelector("button")
    const player1Input = modal.querySelector(".input-container input#username")
    const player2Input = modal.querySelectorAll(".input-container input#username")[1]
    const aiToggle = modal.querySelector(".ai-toggle")
    const userMarkX = modal.querySelector("input#x")

    const updateAiState = () => {
        const aiModeChecked = aiToggle.checked

        const userNameInput = document.querySelectorAll(".player-name-input")
        const fieldset = document.querySelector("fieldset")

        if (aiModeChecked) {

            userNameInput[0].children[0].textContent = "Player 1"
            userNameInput[1].style.display = "none"

            fieldset.style.display = "flex"
        } else {
            userNameInput[0].children[0].textContent = "Player 1 (X)"
            userNameInput[1].style.display  = "flex"
            
             fieldset.style.display = "none"
        }
    }

    updateAiState()
    
    aiToggle.addEventListener("click", updateAiState)


    startButton.addEventListener("click", () => {
        const player1Name = player1Input.value.trim() || "Player One"
        const player2Name = player2Input.value.trim() || "Player Two"
        const playAgainstAI = aiToggle.checked
        const userMark = userMarkX.checked ? "X" : "O"

        game = GameController(player1Name, player2Name, playAgainstAI, userMark)
    
        modal.close()
        modal.style.display = "none"
        updateScreen()
      })

    updateScreen()

    dialog.showModal()
})()
