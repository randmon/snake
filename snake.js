const board_color = "#404448";
const board_border = "#000000";
const snake_color = "#49daf0";
const snake_border = "#246d9e";
const food_color = "#bbff96";
const food_border = "#44783d";

const START_SNAKE = [
  { x: 200, y: 200 },
  { x: 190, y: 200 },
  { x: 180, y: 200 },
  { x: 170, y: 200 }
];

let snake = [...START_SNAKE];
let score = 0;
const GAME_STATES = {
  START: 0,
  PLAYING: 1,
  GAME_OVER: 2,
}
let game_state = GAME_STATES.START;
let changing_direction = false;
let food_x;
let food_y;

// Snake direction
const SPEED = 10;
let dx = SPEED;
let dy = 0;


const snakeboard = document.getElementById("snakeboard");
const snakeboard_ctx = snakeboard.getContext("2d");
clear_board();
gen_food();
drawFood();
drawSnake();
document.addEventListener("keydown", handle_keyPress);


function main() {
  if (has_game_ended()) {
    game_over();
    return;
  } else if(game_state === GAME_STATES.START) {
    return;
  }

  changing_direction = false;
  
  setTimeout(function onTick() {
    clear_board();
    drawFood();
    move_snake();
    drawSnake();
    main();
  }, 100);
}

function drawRectWithBorder(x, y, width, height, color, border) {
  snakeboard_ctx.fillStyle = color;
  snakeboard_ctx.strokeStyle = border;
  snakeboard_ctx.fillRect(x, y, width, height);
  snakeboard_ctx.strokeRect(x, y, width, height);
}

function clear_board() {
  drawRectWithBorder(0, 0, snakeboard.width, snakeboard.height, board_color, board_border);
}

function drawSnake() {
  snake.forEach(drawSnakePart);
}

function drawFood() {
  drawRectWithBorder(food_x, food_y, 10, 10, food_color, food_border);
}

// Draw one snake part
function drawSnakePart(snakePart) {
  drawRectWithBorder(snakePart.x, snakePart.y, 10, 10, snake_color, snake_border);
}

function has_game_ended() {
  // Snake hits itself
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  return false;
}

function random_food(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function gen_food() {
  food_x = random_food(0, snakeboard.width - 10);
  food_y = random_food(0, snakeboard.height - 10);
  // if the new food location is where the snake currently is, generate a new food location
  if (snake.some(part => part.x === food_x && part.y === food_y)) gen_food();
}

function handle_keyPress(event) {
  if(game_state === GAME_STATES.START) {
    game_state = GAME_STATES.PLAYING;
    document.getElementById("score").innerHTML = score;
    main();
  } else if(game_state === GAME_STATES.GAME_OVER) {
    game_state = GAME_STATES.START;
    game_restart();
  } else {

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const W_KEY = 87;
    const A_KEY = 65;
    const S_KEY = 83;
    const D_KEY = 68;

    if (changing_direction) return;
    changing_direction = true;

    const keyPressed = event.keyCode;
    const goingUp = dy === -SPEED;
    const goingDown = dy === SPEED;
    const goingRight = dx === SPEED;
    const goingLeft = dx === -SPEED;
    if (keyPressed === (A_KEY || LEFT_KEY) && !goingRight) {
      dx = -SPEED
      dy = 0;
    }
    if (keyPressed === (W_KEY || UP_KEY) && !goingDown) {
      dx = 0;
      dy = -SPEED;
    }
    if (keyPressed === (D_KEY || RIGHT_KEY) && !goingLeft) {
      dx = SPEED;
      dy = 0;
    }
    if (keyPressed === (S_KEY || DOWN_KEY) && !goingUp) {
      dx = 0;
      dy = SPEED;
    }
  }
}

function game_restart() {
  snake = [...START_SNAKE];
  score = 0;
  dx = SPEED;
  dy = 0;
  clear_board();
  gen_food();
  drawFood();
  drawSnake();
  document.getElementById("score").innerHTML = "Press any key to start";
}

function game_over() {
  game_state = GAME_STATES.GAME_OVER;

  // Add red border to snakeboard
  snakeboard_ctx.strokeStyle = '#ff3f2e';
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);

  // Draw red square where snake died
  snakeboard_ctx.fillStyle = '#ff3f2e';
  snakeboard_ctx.fillRect(snake[0].x, snake[0].y, 10, 10);
  snakeboard_ctx.strokeStyle = '#b01e3e';
  snakeboard_ctx.strokeRect(snake[0].x, snake[0].y, 10, 10);

  document.getElementById("score").innerHTML = "Game Over! Score: " + score + "<br>Press any key to restart";
}


function move_snake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Allow looping through walls
  if (head.x < 0) head.x = snakeboard.width - 10;
  if (head.x > snakeboard.width - 10) head.x = 0;
  if (head.y < 0) head.y = snakeboard.height - 10;
  if (head.y > snakeboard.height - 10) head.y = 0;

  snake.unshift(head);
  if (snake[0].x === food_x && snake[0].y === food_y) {
    score += 1;
    document.getElementById("score").innerHTML = score;
    gen_food();
  } else {
    snake.pop();
  }
}
