let maze = [];
let playerPosition = { x: 0, y: 0 };
let score = 0;
let level = 1;
let difficulty = 30;
let soundEnabled = true;
let mazeSize = 8;
let highScore = localStorage.getItem('mazehighscore') || 0;

let finishEnabled = false; // Флаг для включения перемещения финиша

const sounds = {
    move: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    wall: new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3')
};

function playSound(type) {
    if (!soundEnabled) return;
    sounds[type].play().catch(console.error);
}

function createCell(x, y, isWall = false) {
    return {
        x,
        y,
        isWall,
        isPath: false,
        isVisited: false
    };
}

function generateMaze() {
    mazeSize = 8 + Math.floor(level / 3);
    maze = Array(mazeSize).fill(null).map((_, y) =>
        Array(mazeSize).fill(null).map((_, x) => createCell(x, y))
    );

    // Создаем путь от старта к финишу
    let currentX = 0;
    let currentY = 0;
    let targetX = mazeSize - 1;
    let targetY = mazeSize - 1;

    if (finishEnabled) {
        // Перемещаем финиш на случайную позицию
        targetX = Math.floor(Math.random() * mazeSize);
        targetY = Math.floor(Math.random() * mazeSize);
    }

    while (currentX !== targetX || currentY !== targetY) {
        if (currentX < targetX && Math.random() > 0.5) {
            currentX++;
        } else if (currentY < targetY) {
            currentY++;
        } else {
            currentX++;
        }
        maze[currentY][currentX].isPath = true;
    }

    // Добавляем случайные стены
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (!maze[y][x].isPath && Math.random() < difficulty / 100) {
                maze[y][x].isWall = true;
            }
        }
    }

    maze[0][0].isWall = false;
    maze[targetY][targetX].isWall = false;
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
            } else if (x === mazeSize - 1 && y === mazeSize - 1 && finishEnabled) {
                cell.classList.add('target');
            } else if (maze[y][x].isWall) {
                cell.classList.add('wall');
            }

            mazeElement.appendChild(cell);
        }
    }
}

function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (newX >= 0 && newY >= 0 && newX < mazeSize && newY < mazeSize && !maze[newY][newX].isWall) {
        playerPosition = { x: newX, y: newY };
        playSound('move');
        renderMaze();

        // Проверка на финиш
        if (playerPosition.x === mazeSize - 1 && playerPosition.y === mazeSize - 1) {
            playSound('win');
            setTimeout(() => {
                alert('Вы выиграли!');
                generateMaze();
            }, 500);
        }
    } else {
        playSound('wall');
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
    }
});

function openSettings() {
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
    level = parseInt(document.getElementById('level').value);
    difficulty = parseInt(document.getElementById('difficulty').value);
    finishEnabled = document.getElementById('finish-toggle').checked;
    soundEnabled = document.getElementById('sound-toggle').checked;
    generateMaze();
}

document.getElementById('settings-btn').addEventListener('click', openSettings);
document.getElementById('difficulty').addEventListener('input', (event) => {
    document.getElementById('difficulty-value').innerText = event.target.value;
});

window.onload = () => {
    generateMaze();
};
