
const game = {
   boardWidth: 31,
   boardHeight: 22  ,
   eachPixel: 15, // in pixel
   start: null,
   isStop: true,
   isOver: true,
   score: 0,
   speed: 70 // in milliseconds
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
   cooldown: 8, // this variable is prevent from users to spam shooting, so then it will be too easy
   countCooldown: 0
}

const enemies = {
   position: [],
   span: game.boardWidth - 4,
   rows: 5,
   direction: 1,
   delay: 20,
   countDelay: 0,
   shotEnemies: []
}


//// document element ////
const container = document.getElementById('container');
const startbtn = document.getElementById('start');
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

   game.start = null;
   game.score = 0;

   player.direction = 0;
   player.countCooldown = 0;
   player.bullet = [];
   player.shape = [
      [middle],
      [middle - 1, middle, middle + 1]
   ];

   enemies.position = [];
   enemies.direction = 1;
   enemies.countDelay = enemies.delay;
   enemies.shotEnemies = [];

}
newGame();

////////////////////////////
function set(){
   game.isOver = false;
   game.isStop = false;
   createPlayer();
   createEnemies();

   game.start = setInterval(startGame, game.speed);
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

function createEnemies(){
   enemies.position = [];
   for(let i = 0; i < enemies.rows; i++){
      for(let j = 0; j < enemies.span; j++){
         enemies.position.push((i * game.boardWidth) + j + game.boardWidth);
      }
   }
   enemies.position.forEach(enemy => {
      pixel[enemy].classList.add('enemy');
   })


}


////////////////////////////
function startGame(){
   if(!game.isStop){

         checkGame();

      movePlayer();
      moveBullet();
      moveEnemies();
      
      drawPlayer();
      drawBullet();
      drawEnemies();
      
      checkHit();
   }
}

let left;
let right;

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

function moveEnemies(){

   if(enemies.countDelay == 0){

      const left = enemies.position.filter(enemy => enemy )[0];
      const right = enemies.position[enemies.position.length - 1];
      
      if((  left % game.boardWidth == 0 && enemies.direction == -1) ||
         (  right % game.boardWidth == game.boardWidth - 1 && enemies.direction == 1)) 
      enemies.direction = game.boardWidth;
      
      else if(enemies.direction == game.boardWidth && left % game.boardWidth == 0)
         enemies.direction = 1;

      else if(enemies.direction == game.boardWidth && right % game.boardWidth == game.boardWidth - 1)
         enemies.direction = -1;
      
      enemies.position = enemies.position.map(enemy =>
         enemy + enemies.direction);

      enemies.shotEnemies = enemies.shotEnemies.map(shot => 
         shot + enemies.direction);

      enemies.countDelay = enemies.delay;
   }

   enemies.countDelay--;
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
      if(
         pixel[element].classList.contains('enemy')
      ){
         game.score++;

         pixel[element].classList.remove('enemy');
         pixel[element].classList.remove('bullet');
         player.bullet = player.bullet.filter(bullet => bullet != element);
         enemies.shotEnemies.push(element);

      }
   })
}

function drawEnemies(){
   let enemyIsOnTheFloor = false;
   pixel.forEach(element => {
      element.classList.remove('enemy');
   });

   enemies.position.forEach(enemy => {
      if(
         !enemies.shotEnemies.includes(enemy) && 
         enemy < (game.boardWidth * game.boardHeight)
      )
      {
         pixel[enemy].classList.add('enemy');
         // check if the enemy is on the floor
         if(
            (game.boardHeight - 1) * game.boardWidth <= enemy 
         )
         enemyIsOnTheFloor = true;
      }

   })

   if(enemyIsOnTheFloor){
      endGame('game over');
   }
}

function checkHit(){
   for(let i = 0; i < player.shape.length; i++){
      player.shape[i].forEach(element => {
         const body = Number(element) + ((Number(game.boardHeight - 2 + i)) * Number(game.boardWidth));
         if(
            pixel[body].classList.contains('enemy')
         ){
            endGame('game over');
         }
      })
   }
}


startbtn.onclick = (event) => {
   if(event.pointerType === 'mouse'){
      if(!game.isStop && !game.isOver){
         game.isStop = true;
         startbtn.innerText = 'continue';
         startbtn.className = 'green';
         clearInterval(game.start);
      }
      else if(game.isStop && !game.isOver){
         game.isStop =  false;
         startbtn.innerText = 'stop';
         startbtn.className = 'red';
         game.start = setInterval(startGame, game.speed);
      }
      else if(game.isOver){
         startbtn.innerText = 'pause';
         startbtn.className = 'red';
         newGame();
         set();
      }
   }
}

document.addEventListener('keydown', (e) => {
 
   if(!game.isStop){

      if(e.key === ' '){
         createBullet();
      }
      else if(e.key === 'ArrowRight'){
         player.direction = 1;
      }
      else if(e.key === 'ArrowLeft'){
         player.direction = -1;
      }

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

function endGame(msg){
   clearInterval(game.start);
   game.isOver = true;
   game.isStop = true;
   startbtn.innerText = 'start';
   startbtn.className = 'green';
   setTimeout(() => alert(msg), 200);
}

function checkGame(){
   if(
      enemies.position.length <= enemies.shotEnemies.length &&
      shotAllEnemies()
   ){
      endGame('You win!');
   }
}

function shotAllEnemies(){
   let allEnemies = true;
   enemies.position.forEach(enemy => {
      if(!enemies.shotEnemies.includes(enemy)){
         allEnemies = false;
      }
   })
   return allEnemies;
}
