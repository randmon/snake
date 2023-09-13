import level0 from '../data/levels/level0.json' assert { type: "json" };
import level1 from '../data/levels/level1.json' assert { type: "json" };
import level2 from '../data/levels/level2.json' assert { type: "json" };

const LEVELS = [level0, level1, level2];

const board_color = "#404448";
const board_border = "#000000";
const wall_color = "#ffffff";
const wall_border = "#a0a0a0";
const snake_color = "#49daf0";
const snake_border = "#246d9e";
const food_color = "#bbff96";
const food_border = "#44783d";

let start_snake;
let snake;
let walls;
let current_level;
let score = 0;
let highscore = 0;
const GAME_STATES = {
  LEVEL_SELECT: 0,
  START: 1,
  PLAYING: 2,
  GAME_OVER: 3
}
let game_state = GAME_STATES.LEVEL_SELECT;
let changing_direction = false;
let food_x;
let food_y;

// Snake direction
const SPEED = 10;
let dx = SPEED;
let dy = 0;


const snakeboard = document.getElementById("snakeboard");
const snakeboard_ctx = snakeboard.getContext("2d");
const restart_button = document.getElementById("restart");
const score_element = document.getElementById("score");
const level_select_element = document.getElementById("level_select");
const highscore_element = document.getElementById("highscore");
const change_level_button = document.getElementById("change_level");
const restart_section_element = document.getElementById("restart_section");

restart_button.addEventListener("click", game_restart);
change_level_button.addEventListener("click", level_select_menu);
document.addEventListener("keydown", handle_keyPress);
document.getElementById("level0").addEventListener("click", () => start_level(0));
document.getElementById("level1").addEventListener("click", () => start_level(1));
document.getElementById("level2").addEventListener("click", () => start_level(2));

function level_select_menu() {
  game_state = GAME_STATES.LEVEL_SELECT;
  snakeboard.setAttribute("style", "display: none;");
  score_element.setAttribute("style", "display: none;");
  level_select_element.setAttribute("style", "display: block;");
  restart_section_element.setAttribute("style", "display: none;");
}

function start_level(level) {
  current_level = LEVELS[level];
  start_snake = current_level?.snake || [
    { x: 200, y: 200 }, 
    { x: 190, y: 200 }, 
    { x: 180, y: 200 }, 
    { x: 170, y: 200 }
  ];
  snake = [...start_snake];
  walls = current_level?.walls || [];
  level_select_element.setAttribute("style", "display: none;");
  score_element.setAttribute("style", "display: block;");
  game_restart();
}

function main() {
  if (game_state === GAME_STATES.START) return;
  if (has_game_ended()) {
    game_over();
    restart_button.setAttribute("style", "display: inline-block;");
    return;
  }

  changing_direction = false;
  
  setTimeout(function onTick() {
    draw_board();
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

function draw_board() {
  // Draw board
  drawRectWithBorder(0, 0, snakeboard.width, snakeboard.height, board_color, board_border);
  // Draw walls
  walls.forEach((wall) => {
    // A wall is an object with x, y, width, height
    // Draw a square for each 10x10 pixel block
    for (let i = 0; i < wall.width; i += 10) {
      for (let j = 0; j < wall.height; j += 10) {
        drawRectWithBorder(wall.x + i, wall.y + j, 10, 10, wall_color, wall_border);
      }
    }
  });
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

  // Snake hits wall
  for (let i = 0; i < walls.length; i++) {
    if (snake[0].x >= walls[i].x && snake[0].x < walls[i].x + walls[i].width &&
        snake[0].y >= walls[i].y && snake[0].y < walls[i].y + walls[i].height) return true;
  }

  return false;
}

function random_food(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 10) * 10;
}

function gen_food() {
  food_x = random_food(0, snakeboard.width - 10);
  food_y = random_food(0, snakeboard.height - 10);
  // cannot be on snake or wall
  if (snake.some(part => part.x === food_x && part.y === food_y) ||
      walls.some(wall => food_x >= wall.x && food_x < wall.x + wall.width &&
                          food_y >= wall.y && food_y < wall.y + wall.height)) {
    gen_food();
  }
}

function handle_keyPress(event) {
  if(game_state === GAME_STATES.START) {
    game_state = GAME_STATES.PLAYING;
    score_element.innerHTML = score;
    main();
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
  game_state = GAME_STATES.START;
  snakeboard.setAttribute("style", "display: inline-block;");
  snake = [...start_snake];
  score = 0;
  dx = SPEED;
  dy = 0;
  draw_board();
  gen_food();
  drawFood();
  drawSnake();
  score_element.innerHTML = "Press any key to start";
  restart_section_element.setAttribute("style", "display: none;");
}

function game_over() {
  game_state = GAME_STATES.GAME_OVER;

  // Add red border to snakeboard
  snakeboard_ctx.strokeStyle = '#ff3f2e';
  snakeboard_ctx.lineWidth = 3;
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
  snakeboard_ctx.lineWidth = 1;

  // Draw red square where snake died
  snakeboard_ctx.fillStyle = '#ff3f2e';
  snakeboard_ctx.fillRect(snake[0].x, snake[0].y, 10, 10);
  snakeboard_ctx.strokeStyle = '#b01e3e';
  snakeboard_ctx.strokeRect(snake[0].x, snake[0].y, 10, 10);

  score_element.innerHTML = "Game Over! Score: " + score;

  if (score > highscore) {
    highscore = score;
    document.getElementById("highscore").innerHTML = "Highscore: " + highscore;
  }

  // Show restart button
  restart_section_element.setAttribute("style", "display: block;");
}


function move_snake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Allow looping through edges
  if (head.x < 0) head.x = snakeboard.width - 10;
  if (head.x > snakeboard.width - 10) head.x = 0;
  if (head.y < 0) head.y = snakeboard.height - 10;
  if (head.y > snakeboard.height - 10) head.y = 0;

  snake.unshift(head);
  if (snake[0].x === food_x && snake[0].y === food_y) {
    score += 1;
    score_element.innerHTML = score;
    gen_food();
  } else {
    snake.pop();
  }
}
