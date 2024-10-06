let player;
let planets = [];
let stars = [];
let asteroids = [];
let cameraOffset;
const WORLD_SIZE = 2000;
const VISIBLE_RADIUS = 1000;
let playerCoins = 100;
let gameState = 'exploring'; // 'exploring', 'shop', 'planet', 'minigame'
let currentPlanet = null;
let currentMinigame = null;
let boostTimer = 0;
let boostDuration = 3; // seconds
let boostCooldown = 10; // seconds
let lastBoostTime = -boostCooldown;
let planetColors = [
  [255, 0, 0],    // red
  [255, 165, 0],  // orange
  [255, 255, 0],  // yellow
  [0, 255, 0],    // green
  [0, 0, 255],    // blue
  [75, 0, 130],   // indigo
  [238, 130, 238],// violet
  [128, 0, 128]   // purple
];
let currentColorIndex = 0;

function setup() {
  createCanvas(800, 600);
  player = new Player(width / 2, height / 2);
  cameraOffset = createVector(0, 0);
  generateContent(0, 0);
}

function draw() {
  switch (gameState) {
    case 'exploring':
      drawExploringState();
      break;
    case 'shop':
      drawShop();
      break;
    case 'planet':
      drawPlanetExploration();
      break;
    case 'minigame':
      drawMinigame();
      break;
  }
}

function drawExploringState() {
  background(0);
  updateCamera();
  handlePlayerMovement();
  drawStars();
  drawPlanets();
  drawAsteroids();
  player.update();
  player.display();
  checkBoundaries();
  drawUI();
}

function updateCamera() {
  let targetX = width / 2 - player.pos.x;
  let targetY = height / 2 - player.pos.y;
  cameraOffset.x = lerp(cameraOffset.x, targetX, 0.1);
  cameraOffset.y = lerp(cameraOffset.y, targetY, 0.1);
}

function handlePlayerMovement() {
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) player.accelerate(0, -1);
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) player.accelerate(0, 1);
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.accelerate(-1, 0);
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.accelerate(1, 0);
}

function generateContent(centerX, centerY) {
    for (let i = 0; i < 5; i++) {
      let x = centerX + random(-VISIBLE_RADIUS, VISIBLE_RADIUS);
      let y = centerY + random(-VISIBLE_RADIUS, VISIBLE_RADIUS);
      planets.push(new Planet(x, y, planetColors[currentColorIndex]));
    }
  
    for (let i = 0; i < 200; i++) {
      let x = centerX + random(-VISIBLE_RADIUS, VISIBLE_RADIUS);
      let y = centerY + random(-VISIBLE_RADIUS, VISIBLE_RADIUS);
      stars.push(new Star(x, y, random(1, 3)));
    }
  
    for (let i = 0; i < 50; i++) {
      let x = centerX + random(-VISIBLE_RADIUS, VISIBLE_RADIUS);
      let y = centerY + random(-VISIBLE_RADIUS, VISIBLE_RADIUS);
      asteroids.push(new Asteroid(x, y));
    }
  }

function drawStars() {
  push();
  translate(cameraOffset.x, cameraOffset.y);
  for (let star of stars) {
    if (isVisible(star.pos)) star.display();
  }
  pop();
}

function drawPlanets() {
  push();
  translate(cameraOffset.x, cameraOffset.y);
  for (let planet of planets) {
    if (isVisible(planet.pos)) {
      planet.display();
      if (player.nearPlanet(planet)) {
        showInteractionPrompt(planet);
      }
    }
  }
  pop();
}

function drawAsteroids() {
  push();
  translate(cameraOffset.x, cameraOffset.y);
  for (let asteroid of asteroids) {
    if (isVisible(asteroid.pos)) {
      asteroid.update();
      asteroid.display();
    }
  }
  pop();
}

function isVisible(pos) {
  return pos.x > -cameraOffset.x && pos.x < -cameraOffset.x + width &&
         pos.y > -cameraOffset.y && pos.y < -cameraOffset.y + height;
}

function checkBoundaries() {
  let playerQuadrant = createVector(floor(player.pos.x / WORLD_SIZE), floor(player.pos.y / WORLD_SIZE));
  
  if (playerQuadrant.x !== 0 || playerQuadrant.y !== 0) {
    for (let obj of [...planets, ...stars, ...asteroids]) {
      obj.pos.x -= playerQuadrant.x * WORLD_SIZE;
      obj.pos.y -= playerQuadrant.y * WORLD_SIZE;
    }
    player.pos.x -= playerQuadrant.x * WORLD_SIZE;
    player.pos.y -= playerQuadrant.y * WORLD_SIZE;
    
    generateNewContent(playerQuadrant.x, playerQuadrant.y);
  }
}

function generateNewContent(dx, dy) {
  let removeDistance = VISIBLE_RADIUS * 1.5;
  planets = planets.filter(p => p.pos.dist(player.pos) < removeDistance);
  stars = stars.filter(s => s.pos.dist(player.pos) < removeDistance);
  asteroids = asteroids.filter(a => a.pos.dist(player.pos) < removeDistance);

  generateContent(player.pos.x + dx * WORLD_SIZE, player.pos.y + dy * WORLD_SIZE);
}

class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.size = 20;
    this.maxSpeed = 5;
    this.boosting = false;
    this.boostMultiplier = 2;
  }
    accelerate(x, y) {
      let force = createVector(x, y).setMag(0.5);
      if (this.boosting) {
        force.mult(this.boostMultiplier);
      }
      this.acc.add(force);
    }
  
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.boosting ? this.maxSpeed * this.boostMultiplier : this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.set(0, 0);
      this.vel.mult(0.98); // Add some friction
  
      if (this.boosting) {
        boostTimer -= 1/60;
        if (boostTimer <= 0) {
          this.boosting = false;
        }
      }
    }
  
    display() {
      push();
      translate(width / 2, height / 2);
      rotate(this.vel.heading() + PI / 2);
      
      fill(this.boosting ? color(255, 165, 0) : 200);
      stroke(100);
      strokeWeight(2);
      triangle(-10, 10, 0, -20, 10, 10);
      
      if (this.boosting) {
        fill(255, 0, 0);
        noStroke();
        triangle(-5, 15, 0, 25, 5, 15);
      }
      
      pop();
    }
  
    nearPlanet(planet) {
      return this.pos.dist(planet.pos) < planet.size * 1.5;
    }
  
    boost() {
      if (millis() - lastBoostTime > boostCooldown * 1000) {
        this.boosting = true;
        boostTimer = boostDuration;
        lastBoostTime = millis();
      }
    }
  }
  
  class Planet {
    constructor(x, y, colorArray) {
      this.pos = createVector(x, y);
      this.size = random(80, 150);
      this.color = color(colorArray[0], colorArray[1], colorArray[2]);
      this.resources = floor(random(50, 200));
      this.atmosphereColor = color(colorArray[0], colorArray[1], colorArray[2], 100);
      this.atmosphereSize = this.size * 1.2;
      this.rotation = random(TWO_PI);
      this.rotationSpeed = random(-0.02, 0.02);
      this.cleared = false;
    }
  
    display() {
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.rotation);
      
      // Atmosphere
      fill(this.atmosphereColor);
      ellipse(0, 0, this.atmosphereSize, this.atmosphereSize);
      
      // Planet
      fill(this.color);
      ellipse(0, 0, this.size, this.size);
      
      // Surface details
      stroke(0, 50);
      noFill();
      for (let i = 0; i < 3; i++) {
        arc(0, 0, this.size * 0.8, this.size * 0.8, random(TWO_PI), random(TWO_PI));
      }
      
      pop();
      
      this.rotation += this.rotationSpeed;
    }
  }

class Asteroid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 2));
    this.size = random(5, 15);
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    fill(150);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }
}

class Star {
    constructor(x, y, size) {
      this.pos = createVector(x, y);
      this.size = size;
    }
  
    display() {
      fill(255);
      ellipse(this.pos.x, this.pos.y, this.size);
    }
  }


function showInteractionPrompt(planet) {
  fill(255);
  textAlign(CENTER);
  textSize(14);
  text('Press E to Explore', planet.pos.x, planet.pos.y + planet.size / 2 + 20);
}

function drawUI() {
    fill(255);
    textAlign(LEFT);
    textSize(16);
    text(`Coins: ${playerCoins}`, 10, 20);
    text(`Speed: ${player.vel.mag().toFixed(2)}`, 10, 40);
    text('Press S for Shop', 10, height - 40);
    text('Press SPACE to Boost', 10, height - 20);
  
    // Boost cooldown indicator
    let cooldownProgress = min((millis() - lastBoostTime) / (boostCooldown * 1000), 1);
    fill(100);
    rect(10, 60, 100, 10);
    fill(0, 255, 0);
    rect(10, 60, 100 * cooldownProgress, 10);
    fill(255);
    text('Boost', 120, 70);
  }
  
  function keyPressed() {
    if (key === 'E' || key === 'e') {
      if (gameState === 'exploring') explorePlanet();
    } else if (key === 'S' || key === 's') {
      if (gameState === 'exploring') openShop();
    } else if (key === 'M' || key === 'm') {
      if (gameState === 'planet') startMinigame();
    } else if (key === 'Escape') {
      if (gameState !== 'exploring') gameState = 'exploring';
    } else if (gameState === 'shop' && key >= '1' && key <= '3') {
      buyShopItem(int(key) - 1);
    } else if (key === ' ') {
      player.boost();
    }
  }

  function explorePlanet() {
    for (let planet of planets) {
      if (player.nearPlanet(planet) && !planet.cleared) {
        currentPlanet = planet;
        gameState = 'planet';
        break;
      }
    }
  }

  function endMinigame() {
    let reward = currentMinigame.score * 10;
    playerCoins += reward;
    currentPlanet.resources -= reward;
    currentPlanet.cleared = true;
    gameState = 'planet';
    console.log(`Minigame ended. You earned ${reward} coins!`);
  
    // Check if all planets of the current color are cleared
    if (planets.every(planet => planet.cleared)) {
      currentColorIndex++;
      if (currentColorIndex < planetColors.length) {
        generateNewPlanets();
      } else {
        console.log("Congratulations! You've cleared all planet colors!");
        // You can add a game-winning condition or reset here
      }
    }
  }

  function generateNewPlanets() {
    planets = [];
    for (let i = 0; i < 5; i++) {
      let x = random(-VISIBLE_RADIUS, VISIBLE_RADIUS);
      let y = random(-VISIBLE_RADIUS, VISIBLE_RADIUS);
      planets.push(new Planet(x, y, planetColors[currentColorIndex]));
    }
  }

function openShop() {
  gameState = 'shop';
}

// Shop functionality
let shopItems = [
  { name: 'Speed Boost', cost: 50, effect: () => { player.maxSpeed += 1; } },
  { name: 'Resource Scanner', cost: 100, effect: () => { /* Implement resource scanning */ } },
  { name: 'Asteroid Shield', cost: 150, effect: () => { /* Implement asteroid shield */ } }
];

function drawShop() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(24);
  text('Space Shop', width / 2, 50);
  
  for (let i = 0; i < shopItems.length; i++) {
    let item = shopItems[i];
    text(`${i + 1}. ${item.name} - ${item.cost} coins`, width / 2, 100 + i * 30);
  }
  
  text(`Coins: ${playerCoins}`, width / 2, height - 50);
  text('Press 1-3 to buy, ESC to exit', width / 2, height - 20);
}

function buyShopItem(index) {
  let item = shopItems[index];
  if (playerCoins >= item.cost) {
    playerCoins -= item.cost;
    item.effect();
    console.log(`Bought ${item.name}`);
  } else {
    console.log('Not enough coins');
  }
}

// Planet exploration
function drawPlanetExploration() {
    background(currentPlanet.color);
    
    // Draw a top-down view of the planet
    push();
    translate(width / 2, height / 2);
    
    // Atmosphere
    fill(currentPlanet.atmosphereColor);
    ellipse(0, 0, 500, 500);
    
    // Planet surface
    fill(currentPlanet.color);
    ellipse(0, 0, 400, 400);
    
    // Surface details
    stroke(0, 50);
    noFill();
    for (let i = 0; i < 5; i++) {
      arc(0, 0, 320, 320, random(TWO_PI), random(TWO_PI));
    }
    
    // Player position on planet
    fill(255);
    ellipse(cos(frameCount * 0.05) * 150, sin(frameCount * 0.05) * 150, 20, 20);
    
    pop();
    
    // UI
    fill(255);
    textAlign(CENTER);
    textSize(24);
    text(`Exploring ${currentPlanet.color} Planet`, width / 2, 50);
    text(`Resources: ${currentPlanet.resources}`, width / 2, 100);
    text('Press M for Minigame', width / 2, height - 50);
    text('Press ESC to leave planet', width / 2, height - 20);
  }

// Minigame
function startMinigame() {
  gameState = 'minigame';
  currentMinigame = {
    timeLeft: 10,
    score: 0,
    targets: []
  };
  for (let i = 0; i < 5; i++) {
    currentMinigame.targets.push({
      x: random(width),
      y: random(height),
      size: random(20, 40)
    });
  }
}

function drawMinigame() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(24);
  text(`Time: ${currentMinigame.timeLeft.toFixed(1)}`, width / 2, 30);
  text(`Score: ${currentMinigame.score}`, width / 2, 60);
  
  for (let target of currentMinigame.targets) {
    fill(255, 0, 0);
    ellipse(target.x, target.y, target.size);
  }
  
  currentMinigame.timeLeft -= 1/60; // Assuming 60 FPS
  if (currentMinigame.timeLeft <= 0) {
    endMinigame();
  }
}

function mousePressed() {
  if (gameState === 'minigame') {
    for (let i = currentMinigame.targets.length - 1; i >= 0; i--) {
      let target = currentMinigame.targets[i];
      if (dist(mouseX, mouseY, target.x, target.y) < target.size / 2) {
        currentMinigame.score++;
        currentMinigame.targets.splice(i, 1);
        break;
      }
    }
  }
}

function endMinigame() {
  let reward = currentMinigame.score * 10;
  playerCoins += reward;
  currentPlanet.resources -= reward;
  gameState = 'planet';
  console.log(`Minigame ended. You earned ${reward} coins!`);
}

function keyPressed() {
  if (key === 'E' || key === 'e') {
    if (gameState === 'exploring') explorePlanet();
  } else if (key === 'S' || key === 's') {
    if (gameState === 'exploring') openShop();
  } else if (key === 'M' || key === 'm') {
    if (gameState === 'planet') startMinigame();
  } else if (key === 'Escape') {
    if (gameState !== 'exploring') gameState = 'exploring';
  } else if (gameState === 'shop' && key >= '1' && key <= '3') {
    buyShopItem(int(key) - 1);
  }
}
