
const game = {
   boardWidth: 31,
   boardHeight: 20,
   eachPixel: 15, // in pixel
   start: null
}
const middle = Math.floor(game.boardWidth / 2);

const player = {
   shape: [
      [middle],
      [middle - 1, middle, middle + 1]
      // make it shape like 凸
   ],
   direction: 0,
   bullet: [],
   cooldown: 5,
   countCooldown: 0
}


//// document element ////
const container = document.getElementById('container');
let pixel;
////////

function removeAllChildren(element){
   while(element.firstChild){
      element.removeChild(element.firstChild);
   }
}

function newGame(){
   removeAllChildren(container);
   container.style.width = `${game.boardWidth * game.eachPixel}px`;
   container.style.height = `${game.boardHeight * game.eachPixel}px`;
   for(let i = 0; i < game.boardWidth; i++){
      for(let j = 0; j < game.boardHeight; j++){
         const div = document.createElement('div');
         div.classList.add('pixel');
         div.style.width = `${game.eachPixel}px`;
         div.style.height = `${game.eachPixel}px`;
         container.appendChild(div);
      }
   }
   pixel = document.querySelectorAll('.pixel');
   //console.log(pixel);
   set();
}
newGame();

////////////////////////////
function set(){
   createPlayer();
   //createEnemies();

   game.start = setInterval(startGame, 70);
}

function createPlayer(){
   for(let i = 0; i < player.shape.length; i++){
      for(let j = 0; j < player.shape[i].length; j++){
         pixel[
            player.shape[i][j] + ((game.boardHeight - 2 + i) * game.boardWidth)
         ].classList.add('player');
      }
   }
}


////////////////////////////
function startGame(){
   movePlayer();
   moveBullet();
   //moveEnemies();

   drawPlayer();
   drawBullet();
   //drawEnemies();

   //checkHit();
}

function movePlayer(){
   if(   (player.shape[0][0] % game.boardWidth === 1 && player.direction === -1) || 
         (player.shape[0][0] % game.boardWidth === game.boardWidth - 2 && player.direction === 1)){
      return;
   }
   else {
      for(let i = 0; i < player.shape.length; i++){
         for(let j = 0; j < player.shape[i].length; j++){
            player.shape[i][j] += player.direction;
         }
      }
      player.direction = 0;
   }
}

function moveBullet(){
   for(let i = 0; i < player.bullet.length; i++){
      player.bullet[i] -= game.boardWidth;
   }

   player.bullet = player.bullet.filter(element => 
      0 <= element && element < game.boardWidth * game.boardHeight);

   player.countCooldown <= 0 ?
      player.countCooldown = 0
   :
      player.countCooldown--;
}

function drawPlayer(){
   pixel.forEach(element => {
      element.classList.remove('player');
   });
   for(let i = 0; i < player.shape.length; i++){
      for(let j = 0; j < player.shape[i].length; j++){
         pixel[
            player.shape[i][j] + ((game.boardHeight - 2 + i) * game.boardWidth)
         ].classList.add('player');
      }
   }
}

function drawBullet(){
   pixel.forEach(element => {
      element.classList.remove('bullet');
   });

   player.bullet.forEach(element => {
      //console.log(element)
      pixel[element].classList.add('bullet');
   })
}

let repeating = true;
let repeatRateTimer = null; 

document.addEventListener('keydown', (e) => {
 
   if(e.key === ' '){
      createBullet();
   }
   else if(e.key === 'ArrowRight'){
      player.direction = 1;
   }
   else if(e.key === 'ArrowLeft'){
      player.direction = -1;
   }
   
});

function createBullet(){
   if(player.countCooldown == 0){
      const head = player.shape[0][0] + (game.boardWidth * (game.boardHeight - 2)); 
      const shoot = head - game.boardWidth;
      player.bullet.push(shoot);
      drawBullet();
      player.countCooldown = player.cooldown;
   }
}