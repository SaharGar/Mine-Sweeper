'use strict'

// const context = document.getElementById('table')
// context.addEventListener("contextmenu", e => e.preventDefault());

const BOMB = '💣'
const NUM = ''
const FLAG = '🚩'
const LIVES = '🧡'
const HINT = '💡'

var gBoard;

var gTimerInt;

var gLevel = {
    size: 4,
    mines: 2,
    lives: 1
}
var gLives;
var gHintsCount = 3
var gSafeClickCount = 3

var gGame = {
    isOn: false,
    hintIsOn: false,
    modalIsOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: document.querySelector('.timer').innerText
}

function initGame() {
    gBoard = createBoard()
    renderBoard(gBoard, '.board')
    gGame.isOn = true
    gLives = gLevel.lives
    showLivesIcons()
    showHintsCount()
    safeClickCount()

}

function createBoard() { //need to change loop length when dealing with more levels
    var board = []
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMarked: false,
                isBomb: false
            }

            board[i][j] = cell
        }
    }
    return board
}

function renderBoard(mat, selector) {
    var className;
    var strHTML = '<table id="table"><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            // if (cell.isBomb) {
            //     className = 'cell bomb cell' + '-' + i + '-' + j;
            //     cell = BOMB
            // } else {
            //     className = 'cell num cell' + '-' + i + '-' + j;
            //     cell = NUM
            // }
            className = 'cell cell' + '-' + i + '-' + j;
            strHTML += `<td  onclick="cellClicked(this,${i},${j})"  oncontextmenu="cellMarked(this,${i},${j})" class="${className}">${NUM}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) {
        alert('If you finished the previous game or picked another difficulty mid-game, please start a new game with the emoji button')
        return
    }
    if(gGame.modalIsOn) return
    
    if (elCell.innerText === FLAG) return
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return

    if (gGame.shownCount === 0) {
        startTimer2()
        locatingMines(gLevel.mines, i, j)
    }
    if (gGame.hintIsOn) {
        getHint(gBoard, i, j)
        return
    }
    if (gBoard[i][j].isBomb) {
        elCell.innerText = BOMB
        elCell.classList.add('showed')
        gLives--
        showLivesIcons()
        if (gLives < 1) {
            elCell.style.background = 'linear-gradient(to top, red, white)'
            gameOver(false)
        } else {
            updateMarked(i, j)
            showLives()
        }
    } else {
        var mines = gBoard[i][j].minesAroundCount
        updateShown(i, j)
        if (mines > 0) {
            elCell.innerText = mines
            // checkWin()
        } else {
            // updateShown(i,j)
            expandShown(gBoard, i, j)
            // updateShown(i,j)
        }
        elCell.classList.add('showed')
        checkWin()

    }

}

function cellMarked(elCell, i, j) {
    const context = document.getElementById('table')
    context.addEventListener("contextmenu", e => e.preventDefault());
    if (!gGame.isOn) return
    if(gGame.modalIsOn) return
    if (gBoard[i][j].isShown) return
    if (elCell.innerText === BOMB) return
    if (elCell.innerText === FLAG) {
        gBoard[i][j].isMarked = false
        elCell.innerText = ''
        gGame.markedCount--
    } else {
        elCell.innerText = FLAG
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        checkWin()
    }
}

function locatingMines(numOfMines, iClicked, jClicked) {
    for (var i = 0; i < numOfMines; i++) {
        var pos = checkForEmptyCell()
        if (pos.i === iClicked && pos.j === jClicked) {
            i--
            continue
        }
        gBoard[pos.i][pos.j].isBomb = true
        var elCurrCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
        elCurrCell.classList.add('bomb')
    }
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            countNegs(gBoard, i, j)
        }
    }
}

function showBombs() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isBomb) {
                var elCell = document.querySelector(`.cell-${i}-${j}`)
                cell.isShown = true
                gGame.shownCount++
                elCell.innerText = BOMB
            }
        }
    }
}

function expandShown(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = board[i][j];
            if (cell.isMarked) continue
            if (cell.isShown) continue
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            elCurrCell.classList.add('showed')
            updateShown(i, j)
            if (cell.minesAroundCount > 0) {
                elCurrCell.innerText = cell.minesAroundCount
            } else {
                elCurrCell.innerText = ''
                expandShown(board, i, j)
            }

        }
    }
}

function gameOver(isVictory) {
    var elModal = document.querySelector('.modal')
    var elModalContent = document.querySelector('.modal-content')
    var elRestartBtn = document.querySelector('.new-game button')
    var time = getTime()
    if (!isVictory) {
        elModalContent.innerText = `Damn! Watch out from the mines! 
        
        If you wish to try again please click on the crying emoji`
        elRestartBtn.innerText = '😭'
    } else {
        elModalContent.innerText = `Congratz! 
       
        You have finished the game without exploding! 
       
       
        Your time is: ${time} seconds `
        elRestartBtn.innerText = '🥳'
    }
    showBombs()
    gGame.isOn = false
    elModal.style.display = 'block'
    gGame.modalIsOn = true
    stopClock()
}

function getTime(){
    var elTimer = document.querySelector('.timer').innerText
    var time = elTimer.slice(7)
    return time
}

function checkWin() {
    if (gGame.shownCount === (gLevel.size ** 2) - gLevel.mines) gameOver(true)
    else return

}

function closeModal(){
    document.querySelector('.modal').style.display = 'none'
    gGame.modalIsOn = false
}

function setDifficulty(elBtn) {
    if(gGame.modalIsOn) return
    gGame.isOn = false
    stopClock()
    switch (elBtn.innerText) {
        case 'Easy(4*4)':
            gLevel.size = 4
            gLevel.mines = 2
            gLevel.lives = 1
            break;

        case 'Medium(8*8)':
            gLevel.size = 8
            gLevel.mines = 12
            gLevel.lives = 3
            break;

        case 'Hard(12*12)':
            gLevel.size = 12
            gLevel.mines = 30
            gLevel.lives = 3
            break;
    }
}

function restartGame(elBtn) {
    if(gGame.modalIsOn) return
    stopClock()
    gGame.shownCount = 0
    gGame.markedCount = 0
    gLives = gLevel.lives
    elBtn.innerText = '😀'
    gHintsCount = 3
    gSafeClickCount = 3
    document.querySelector('.timer').innerText = 'Timer: 0.0'
    document.querySelector('.hint').innerHTML = ''

    initGame()
}

function showLives() {
    var elLives = document.querySelector('.lives')
    elLives.innerText = `You stepped on a mine! lives left: ${gLives} `
    elLives.style.opacity = 1

    setTimeout(hideLives, 2000)
}

function showLivesIcons() {
    var elLivesIcons = document.querySelector('.lives-icons')
    var strLives = ''
    for (var i = 0; i < gLives; i++) {
        strLives += LIVES
    }
    elLivesIcons.innerText = strLives
}

function hideLives() {
    var elLives = document.querySelector('.lives')
    elLives.style.opacity = 0
}

function updateShown(i, j) {
    gBoard[i][j].isShown = true
    gGame.shownCount++
}

function updateMarked(i, j) {
    gBoard[i][j].isMarked = true
    gGame.markedCount++
}

function setHintOn() {
    if(!gGame.isOn) return
    if(gGame.modalIsOn) return
    gGame.hintIsOn = true
}

function getHint(board, rowIdx, colIdx) {
    if (!gGame.hintIsOn) return
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            var cell = board[i][j];
            if (cell.isMarked) continue
            if (cell.isShown) continue
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            elCurrCell.classList.add('showed')
            if (cell.isBomb){
                elCurrCell.innerText = BOMB
                continue
            } 
            if (cell.minesAroundCount > 0) elCurrCell.innerText = cell.minesAroundCount
        }
    }
    gHintsCount--
    showHintsCount()
    setTimeout(hideHint, 500, board, rowIdx, colIdx)
    gGame.hintIsOn = false
}

function hideHint(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            var cell = board[i][j];
            if (cell.isMarked) continue
            if (cell.isShown) continue
            var elCurrCell = document.querySelector(`.cell-${i}-${j}`)
            elCurrCell.classList.remove('showed')
            elCurrCell.innerText = ''
        }
    }
}

function showHintsCount() {
    var elHint = document.querySelector('.hint')
    elHint.innerHTML = ''
    for (var i = 0; i < gHintsCount; i++) {
        elHint.innerHTML += `<button class="get-hint" onclick="setHintOn()">${HINT}</button>`
    }
}

function showSafeClick() {
    if(gGame.modalIsOn) return
    if (!gSafeClickCount) return
    if(!gGame.isOn) return
    var pos = checkForEmptyCell2()
    var elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    elCell.classList.add('showed')
    gSafeClickCount--
    safeClickCount()
    setTimeout(hideSafeClick, 100, pos.i, pos.j)
}

function safeClickCount() {
    var elSpan = document.querySelector('.safe-click-Btn span')
    elSpan.innerText = gSafeClickCount
}


function hideSafeClick(i, j) {
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.classList.remove('showed')
}