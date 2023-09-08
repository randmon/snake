const board_color = "#404448";
const board_border = "#000000";
const snake_color = "#49daf0";
const snake_border = "#246d9e";
const food_color = "#bbff96";
const food_border = "#44783d";


let snake = [
  { x: 200, y: 200 },
  { x: 190, y: 200 },
  { x: 180, y: 200 },
  { x: 170, y: 200 },
  { x: 160, y: 200 },
];

let score = 0;
let game_active = false;
let changing_direction = false;
let food_x;
let food_y;

// Snake direction
const speed = 10;
let dx = speed;
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
    // Add red border to snakeboard
    snakeboard_ctx.strokeStyle = '#ff3f2e';
    snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);

    // Draw red square where snake died
    snakeboard_ctx.fillStyle = '#ff3f2e';
    snakeboard_ctx.fillRect(snake[0].x, snake[0].y, 10, 10);
    snakeboard_ctx.strokeStyle = '#b01e3e';
    snakeboard_ctx.strokeRect(snake[0].x, snake[0].y, 10, 10);


    document.getElementById("score").innerHTML = "Game Over!<br>Score: " + score;
    
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
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }
  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > snakeboard.width - 10;
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > snakeboard.height - 10;
  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
}

function random_food(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function gen_food() {
  // Generate a random number the food x-coordinate
  food_x = random_food(0, snakeboard.width - 10);
  // Generate a random number for the food y-coordinate
  food_y = random_food(0, snakeboard.height - 10);
  // if the new food location is where the snake currently is, generate a new food location
  snake.forEach(function has_snake_eaten_food(part) {
    const has_eaten = part.x == food_x && part.y == food_y;
    if (has_eaten) gen_food();
  });
}

function handle_keyPress(event) {
  if(!game_active) {
    game_active = true;
    document.getElementById("score").innerHTML = score;
    main();
  }

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
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;
  if (keyPressed === (A_KEY || LEFT_KEY) && !goingRight) {
    dx = -speed
    dy = 0;
  }
  if (keyPressed === (W_KEY || UP_KEY) && !goingDown) {
    dx = 0;
    dy = -speed;
  }
  if (keyPressed === (D_KEY || RIGHT_KEY) && !goingLeft) {
    dx = speed;
    dy = 0;
  }
  if (keyPressed === (S_KEY || DOWN_KEY) && !goingUp) {
    dx = 0;
    dy = speed;
  }
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
