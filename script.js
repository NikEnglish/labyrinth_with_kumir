let maze = [];
let playerPosition = { x: 0, y: 0 };
let score = 0;
let level = 1;
let difficulty = 30;
let soundEnabled = true;
let mazeSize = 8;
let highScore = localStorage.getItem('mazehighscore') || 0;

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

    // Create path from start to finish
    let currentX = 0;
    let currentY = 0;
    const target = { x: mazeSize - 1, y: mazeSize - 1 };
    
    while (currentX !== target.x || currentY !== target.y) {
        if (currentX < target.x && Math.random() > 0.5) {
            currentX++;
        } else if (currentY < target.y) {
            currentY++;
        } else {
            currentX++;
        }
        maze[currentY][currentX].isPath = true;
    }

    // Add random walls
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (!maze[y][x].isPath && Math.random() < difficulty / 100) {
                maze[y][x].isWall = true;
            }
        }
    }

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
            } else {
                cell.classList.add('empty');
            }
            
            mazeElement.appendChild(cell);
        }
    }
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#f44336' : '#333';
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
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
        newPosition.y < mazeSize
    ) {
        if (!maze[newPosition.y][newPosition.x].isWall) {
            playerPosition = newPosition;
            playSound('move');
            
            if (newPosition.x === mazeSize - 1 && newPosition.y === mazeSize - 1) {
                const levelScore = 100 * level;
                score += levelScore;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('mazehighscore', highScore);
                }
                playSound('win');
                showToast(`Уровень пройден! +${levelScore} очков!`);
                level++;
                generateMaze();
            } else {
                renderMaze();
            }
            updateStats();
        } else {
            playSound('wall');
            showToast('Упс! Там стена!', true);
        }
    }
}

function updateStats() {
    document.getElementById('level').textContent = level;
    document.getElementById('score').textContent = score;
    document.getElementById('highscore').textContent = highScore;
}

// Kumir interpreter functions
function RKN() {
    const code = document.getElementById('kumir-input').value.toLowerCase(); // Приводим код к нижнему регистру

    // Обработка циклов "нц раз" и "нц пока"
    let matches;
    let regex = /(нц раз (\d+) )(.+?)(кц|кон)/g;
    while ((matches = regex.exec(code)) !== null) {
        const times = parseInt(matches[2]);
        const action = matches[3].trim();
        for (let i = 0; i < times; i++) {
            executeCommand(action);
        }
    }

    regex = /(нц пока (.+?) )(.+?)(кц|кон)/g;
    while ((matches = regex.exec(code)) !== null) {
        const condition = matches[2].trim();
        const action = matches[3].trim();
        while (evalCondition(condition)) {
            executeCommand(action);
        }
    }
}

function executeCommand(command) {
    switch (command) {
        case 'вправо':
            movePlayer(1, 0);
            break;
        case 'влево':
            movePlayer(-1, 0);
            break;
        case 'вверх':
            movePlayer(0, -1);
            break;
        case 'вниз':
            movePlayer(0, 1);
            break;
        case 'закрасить':
            maze[playerPosition.y][playerPosition.x].isVisited = true;
            renderMaze();
            break;
        default:
            console.log('Неизвестная команда:', command);
            break;
    }
}

function evalCondition(condition) {
    switch (condition) {
        case 'слева свободно':
            return playerPosition.x > 0 && !maze[playerPosition.y][playerPosition.x - 1].isWall;
        case 'справа свободно':
            return playerPosition.x < mazeSize - 1 && !maze[playerPosition.y][playerPosition.x + 1].isWall;
        case 'вверх свободно':
            return playerPosition.y > 0 && !maze[playerPosition.y - 1][playerPosition.x].isWall;
        case 'вниз свободно':
            return playerPosition.y < mazeSize - 1 && !maze[playerPosition.y + 1][playerPosition.x].isWall;
        case 'слева не свободно':
            return playerPosition.x > 0 && maze[playerPosition.y][playerPosition.x - 1].isWall;
        case 'справа не свободно':
            return playerPosition.x < mazeSize - 1 && maze[playerPosition.y][playerPosition.x + 1].isWall;
        case 'вверх не свободно':
            return playerPosition.y > 0 && maze[playerPosition.y - 1][playerPosition.x].isWall;
        case 'вниз не свободно':
            return playerPosition.y < mazeSize - 1 && maze[playerPosition.y + 1][playerPosition.x].isWall;
        default:
            return false;
    }
}

// Initialize game
generateMaze();
updateStats();
