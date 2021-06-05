// let rocket;
let population;
let generationsCount = 0;
let lifeP;
let generationP;
let count = 0;
let target;
const lifespan = 400;
const rx = 100;
const ry = 150;
const rw = 200;
const rh = 10;

const maxForce = 0.2;

function setup() {
  createCanvas(400, 300);
  // rocket = new Rocket();
  population = new Population();
  lifeP = createP();
  generationP = createP();
  target = createVector(width / 2, 50);
}

function draw() {
  background(0);
  population.run();
  lifeP.html(count);
  generationP.html(generationsCount);
  count++;

  if (count === lifespan) {
    population.evaluate();
    population.selection();
    count = 0;
    generationsCount++;
  }

  fill(255);
  rect(100, 150, 200, 10);

  ellipse(target.x, target.y, 16, 16);
}

function Population() {
  this.rockets = [];
  this.popSize = 100;
  this.matingPool = [];

  for (let i = 0; i < this.popSize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.evaluate = function() {
    let maxFit = 0;

    for (let i = 0; i < this.popSize; i++) {
      this.rockets[i].calcFitness();
      if (this.rockets[i].fitness > maxFit) {
        maxFit = this.rockets[i].fitness;
      }
    }

    for (let i = 0; i < this.popSize; i++) {
      this.rockets[i].fitness /= maxFit;
    }

    this.matingPool = [];

    for (let i = 0; i < this.popSize; i++) {
      let n = this.rockets[i].fitness * 100;
      for (let j = 0; j < n; j++) {
        this.matingPool.push(this.rockets[i]);
      }
    }
  };

  this.selection = function() {
    let newRockets = [];
    for (let i = 0; i < this.rockets.length; i++) {
      let parentA = random(this.matingPool).dna;
      let parentB = random(this.matingPool).dna;
      let childDna = parentA.crossover(parentB);
      childDna.mutation();
      newRockets[i] = new Rocket(childDna);
    }

    this.rockets = newRockets;
  };

  this.run = function() {
    for (let i = 0; i < this.popSize; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  };
}

function DNA(genes) {
  if (genes) {
    this.genes = genes;
  } else {
    this.genes = [];

    for (let i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(maxForce);
    }
  }

  this.crossover = function(partner) {
    let newGenes = [];
    let midPoint = floor(random(this.genes.length));

    for (let i = 0; i < this.genes.length; i++) {
      if (i > midPoint) {
        newGenes[i] = this.genes[i];
      } else {
        newGenes[i] = partner.genes[i];
      }
    }

    return new DNA(newGenes);
  };

  this.mutation = function() {
    for (let i = 0; i < this.genes.length; i++) {
      if (random(1) < 0.01) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(maxForce);
      }
    }
  };
}

function Rocket(dna) {
  this.pos = createVector(width / 2, height);
  this.vel = createVector();
  this.acc = createVector();
  this.completed = false;
  this.crashed = false;
  this.dna = dna || new DNA();
  this.fitness = 0;

  this.applyForce = function(force) {
    this.acc.add(force);
  };

  this.calcFitness = function() {
    let distance = dist(this.pos.x, this.pos.y, target.x, target.y);

    this.fitness = map(distance, 0, width, width, 0);
    if (this.completed) {
      this.fitness *= 10;
    }

    if (this.crashed) {
      this.fitness /= 10;
    }
  };

  this.update = function() {
    const distance = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (distance < 10) {
      this.completed = true;
      this.pos = target.copy();
    }

    if (
      this.pos.x > rx &&
      this.pos.x < rx + rw &&
      this.pos.y > ry &&
      this.pos.y < ry + rh
    ) {
      this.crashed = true;
    }

    if (this.pos.x > width || this.pos.x < 0) {
      this.crashed = true;
    }

    if (this.pos.y > height || this.pos.y < 0) {
      this.crashed = true;
    }

    this.applyForce(this.dna.genes[count]);

    if (!this.completed && !this.crashed) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.vel.limit(4);
    }
  };

  this.show = function() {
    push();
    noStroke();
    fill(255, 150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
  };
}
