let maze = [];
let playerPosition = { x: 0, y: 0 };
let level = 1;
let difficulty = 30;
let mazeSize = 8;

function generateMaze() {
    mazeSize = 8 + Math.floor(level / 3);
    maze = Array(mazeSize).fill(null).map((_, y) =>
        Array(mazeSize).fill(null).map((_, x) => ({
            x, y, isWall: Math.random() < difficulty / 100, isPath: false
        }))
    );

    maze[0][0].isWall = false;
    maze[mazeSize - 1][mazeSize - 1].isWall = false;
    playerPosition = { x: 0, y: 0 };
    renderMaze();
}

function renderMaze() {
    const mazeElement = document.getElementById('maze');
    mazeElement.style.gridTemplateColumns = `repeat(${mazeSize}, 1fr)`;
    mazeElement.innerHTML = '';

    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (x === playerPosition.x && y === playerPosition.y) {
                cell.classList.add('player');
            } else if (x === mazeSize - 1 && y === mazeSize - 1) {
                cell.classList.add('target');
            } else if (maze[y][x].isWall) {
                cell.classList.add('wall');
            }
            mazeElement.appendChild(cell);
        }
    }
}

function movePlayer(dx, dy) {
    const newPosition = {
        x: playerPosition.x + dx,
        y: playerPosition.y + dy
    };

    if (
        newPosition.x >= 0 &&
        newPosition.x < mazeSize &&
        newPosition.y >= 0 &&
        newPosition.y < mazeSize &&
        !maze[newPosition.y][newPosition.x].isWall
    ) {
        playerPosition = newPosition;
        renderMaze();
    }
}

// --- Кумир Интерпретатор ---
function runKumirCode() {
    const code = document.getElementById('kumir-code').value.split('\n').map(line => line.trim());
    let i = 0;

    function executeLine() {
        if (i >= code.length) return;
        const line = code[i];

        if (line === 'вправо') movePlayer(1, 0);
        else if (line === 'влево') movePlayer(-1, 0);
        else if (line === 'вверх') movePlayer(0, -1);
        else if (line === 'вниз') movePlayer(0, 1);
        else if (line.startsWith('закрасить')) {
            const x = playerPosition.x, y = playerPosition.y;
            const cell = document.querySelector(`.maze .cell:nth-child(${y * mazeSize + x + 1})`);
            if (cell) cell.style.backgroundColor = 'red';
        }

        i++;
        setTimeout(executeLine, 500);
    }

    executeLine();
}

// --- Настройки ---
function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

document.getElementById('apply-level-btn').addEventListener('click', () => {
    level = parseInt(document.getElementById('level-input').value);
    generateMaze();
});

generateMaze();
