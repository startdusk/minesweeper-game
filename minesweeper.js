const ROWS = 9
const COLS = 9
const SIZE = 24
const canvas = document.getElementById('canvas')

const cells = new Map()
const revealedKeys = new Set()
const map = generateMap(generateBombs())

function toKey(row, col) {
    return row + '-' + col
}

function fromKey(key) {
    return key.split('-').map(s => Number(s))
}

function createButtons() {
    canvas.style.width = (ROWS * SIZE) + 'px'
    canvas.style.height = (COLS * SIZE) + 'px'
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const cell = document.createElement('button')
            cell.onclick = () => {
                revealCells(key)
            }
            cell.style.float = 'left'
            cell.style.width = SIZE + 'px'
            cell.style.height = SIZE + 'px'
            canvas.appendChild(cell)
            const key = toKey(i, j)
            cells.set(key, cell)
        }
    }
}

function updateButtons() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const key = toKey(i, j)
            const cell = cells.get(key)
            if (revealedKeys.has(key)) {
                cell.disabled = true
                const value = map.get(key)
                if (value === undefined) {
                    cell.textContent = ''
                } else if (value === 1) {
                    cell.style.color = 'blue'
                    cell.textContent = '1'
                } else if (value === 2) {
                    cell.style.color = 'green'
                    cell.textContent = '2'
                } else if (value === 3) {
                    cell.style.color = 'red'
                    cell.textContent = '3'
                } else if (value === 'bomb') {
                    cell.textContent = '💣'
                    cell.style.backgroundColor = 'red'
                } else {
                    throw new Error('TODO')
                }
            } else {
                cell.disabled = false
                cell.textContent = ''
            }
        }
    }
}

function revealCells(key) {
    propagateReveal(key, new Set())
    updateButtons()
}

function propagateReveal(key, visited) {
    revealedKeys.add(key)
    visited.add(key)

    const isEmpty = !map.has(key)
    if (isEmpty) {
        for (let neighborKey of getNeighbors(key)) {
            if (!visited.has(neighborKey)) {
                propagateReveal(neighborKey, visited)
            }
        }
    }
}

function isInBounds([row, col]) {
    if (row < 0 || col < 0) {
        return false
    }
    if (row >= ROWS || col >= COLS) {
        return false
    }
    return true
}

function getNeighbors(key) {
    const [row, col] = fromKey(key)
    const neighborsRowCols = [
        [row - 1, col - 1],
        [row - 1, col],
        [row - 1, col + 1],
        [row, col - 1],
        [row, col + 1],
        [row + 1, col - 1],
        [row + 1, col],
        [row + 1, col + 1],
    ]
    return neighborsRowCols.filter(isInBounds).map(([r, c]) => toKey(r, c))
}

function generateMap(seedBombs) {
    const map = new Map()

    function incrementDanger(neighborKey) {
        if (!map.has(neighborKey)) {
            map.set(neighborKey, 1)
        } else {
            const oldVal = map.get(neighborKey)
            if (oldVal !== 'bomb') {
                const val = parseInt(oldVal) + 1
                map.set(neighborKey, val)
            }
        }
    }

    for (let key of seedBombs) {
        map.set(key, 'bomb')
        for (let neighborKey of getNeighbors(key)) {
            incrementDanger(neighborKey)
        }
    }

    return map
}

function generateBombs() {
    const count = Math.round(Math.sqrt(ROWS * COLS))
    const bombs = []
    const allKeys = []
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            allKeys.push(toKey(i, j))
        }
    }
    allKeys.sort(() => {
        const coinFlip = Math.random() > 0.5
        return coinFlip ? 1 : -1
    })

    return allKeys.slice(0, count)
}

createButtons()