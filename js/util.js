'use strict'

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderCell(location, value) {
    // Select the elCell and set the value 
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function countNegs(mat, rowIdx, colIdx) {
    // console.log(mat)
    var bombsCount = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= mat[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = mat[i][j];
            // console.log('cell', cell);
            if (cell.isBomb) bombsCount++
            
        }
    }
    mat[rowIdx][colIdx].minesAroundCount = bombsCount
}

function checkForEmptyCell() {
    // the empty cell is random
    var emptyCellArr = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if(!currCell.isBomb ){
            var emptyCellPos = { i, j }
            emptyCellArr.push(emptyCellPos)
            }
        }
    }
    var emptyCellIdx = getRandomIntInclusive(0, emptyCellArr.length - 1)
    var emptyCell = emptyCellArr[emptyCellIdx]
    return emptyCell
}

function checkForEmptyCell2() {
    // the empty cell is random
    var emptyCellArr = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if(!currCell.isBomb && !currCell.isShown ){
            var emptyCellPos = { i, j }
            emptyCellArr.push(emptyCellPos)
            }
        }
    }
    var emptyCellIdx = getRandomIntInclusive(0, emptyCellArr.length - 1)
    var emptyCell = emptyCellArr[emptyCellIdx]
    return emptyCell
}

function startTimer() {
    var timer = document.querySelector('.timer');
    var milisec = 0;
    var sec = 0;
    var min = 0;
    milisec++;
    if (milisec > 9) {
        sec++;
        milisec = 0;
    }
    if (sec > 59) {
        min++;
        sec = 0;
    }
    timer.innerText = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec) + ':' + '0' + milisec;
}

function setTimer() {
    var currTime = new Date().getTime()
    // var timer = parseInt((currTime-gStartingTime)/1000)
    var timer = (currTime - gStartingTime) / 1000
    // console.log(timer)
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = `Time:\n ${timer}`
}


function startTimer2() {
    var startTime = Date.now();
    gTimerInt = setInterval(showTimer, 100, startTime);
}
function showTimer(startTime) {
    var timeGap = Date.now() - startTime;
    document.querySelector('.timer').innerHTML = 'Timer: ' + (timeGap / 1000).toFixed(3);
}
function stopClock() {
    clearInterval(gTimerInt);
    // document.querySelector('.timer').innerText = 'Timer: 0.0'
}
