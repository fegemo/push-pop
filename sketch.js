var xAxis = 600 / 2;
var yAxis = 400 / 2;
var Matrizes = [];
var numObj = 0;
var id = [1, 0, 0, 0, 1, 0, 0, 0, 1];
var id2 = [];
var actual = 0;
var tam = 1;
var mulTam = 0.001;
var canvas;



function brackets(x, y) {
	noStroke();

	//LEFT BRACKETS
	rect(x - 50, y - 50, 22, 5);
	rect(x - 50, y - 50, 5, 85);
	rect(x - 50, y + 30, 22, 5);

	//RIGHT BRACKETS
	rect(x + 20, y - 50, 22, 5);
	rect(x + 37, y - 50, 5, 81);
	rect(x + 20, y + 30, 22, 5);
	stroke(0);
}

function Matrix(num, bottomLimit) {

	this.numbers = num;

	this.pos = createVector(xAxis, 0);
	this.vel = createVector(0, 0);
	this.acc = createVector(0, 0.5);
	this.bot = false;

	this.display = function() {

		//rect(this.pos.x - 45, this.pos.y - 45, 80, 75)
		brackets(this.pos.x, this.pos.y);


		var i = 0;
		var x = 1;
		var y = 1;
		while (i < 9) {
			text(this.numbers[i], (this.pos.x + (-30 * x) - 10), (this.pos.y + (-25 * y)));
			if (x == -1) {
				y--;
				x = 2;
			}
			x--;
			i++;
		}
	}

	this.drop = function() {
		if (this.pos.y < bottomLimit - 8) {
			this.pos.y += this.vel.y;
			this.vel.y += this.acc.y;

			return true;
		} else {
			this.bot = true;
			this.pos.y = bottomLimit - 8;
			return false;
		}
	}


}

function ButtonPush() {
	stroke(0, 0, 0);
	rect(35, 350, 50, 25);
	textSize(15);
	text("Push", 41, 367);
}

function ButtonPop() {
	stroke(0, 0, 0);
	rect(515, 350, 50, 25);
	textSize(15);
	text("Pop", 525, 367);
}

function ButtonChangeMatrix() {
	stroke(0, 0, 0);
	rect(515, 300, 75, 25);
	textSize(15);
	text("Change", 525, 320);
}

function cloud(x, y) {
	push();
	noStroke();
	fill(255, 255, 255, 200);
	ellipse(x, y + 20, 100 * tam, 50 * tam);
	ellipse(x + 50, y + 20, 100 * tam, 50 * tam);
	ellipse(x + 25, y, 80 * tam, 50 * tam);

	pop();
}

function mainScreen() {
	background(255, 255, 233, 80);
	background(0, 191, 255, 200);
	text("Elements : " + Matrizes.length, 20, 20);
	cloud(100, 180);
	cloud(400, 100);
	tam += mulTam;
	if (tam >= 1.1 || tam <= 0.9) {
		mulTam *= -1;
	}
	push();
	fill(100, 255, 100);
	rect(0, 370, width, 50);
	pop();
	ButtonChangeMatrix();
	ButtonPush();
	ButtonPop();
	if (Matrizes.length > 0) {
		text("Using", Matrizes[Matrizes.length - 1].pos.x + 45, Matrizes[Matrizes.length - 1].pos.y);
	}
	for (var i = Matrizes.length - 1; i >= 0; i--) {
		if (!Matrizes[i].bot) {
			Matrizes[i].drop();
		}
		Matrizes[i].display();
	}
}

function insertedMatrix(matrix) {
	matrix[0] = document.getElementById("r1c1").value;
	matrix[1] = document.getElementById("r1c2").value;
	matrix[2] = document.getElementById("r1c3").value;

	matrix[3] = document.getElementById("r2c1").value;
	matrix[4] = document.getElementById("r2c2").value;
	matrix[5] = document.getElementById("r2c3").value;

	matrix[6] = document.getElementById("r3c1").value;
	matrix[7] = document.getElementById("r3c2").value;
	matrix[8] = document.getElementById("r3c3").value;
}

function mouseClicked() {
	if (mouseX > 35 && mouseX < 85 && mouseY > 350 && mouseY < 375) {
		if (Matrizes.length == 0) {
			var d3 = [];
			arrayCopy(id2, d3);
			Matrizes.push(new Matrix(d3, height - 51));
		} else if (Matrizes.length == 1) {
			if (Matrizes[Matrizes.length - 1].bot) {
				var d4 = [];
				arrayCopy(Matrizes[Matrizes.length - 1].numbers, d4);
				Matrizes.push(new Matrix(d4, ((Matrizes[Matrizes.length - 1]).pos.y) - 80));
			}
		} else if (Matrizes.length < 4) {
			if (Matrizes[Matrizes.length - 1].bot) {
				var d5 = [];
				arrayCopy(Matrizes[Matrizes.length - 1].numbers, d5);
				Matrizes.push(new Matrix(d5, ((Matrizes[Matrizes.length - 1]).pos.y) - 80));
			}
		}
	}
	if (mouseX > 515 && mouseX < 565 && mouseY > 350 && mouseY < 375) {
		Matrizes.splice(Matrizes.length - 1, 1);
	}
	if (mouseX > 515 && mouseX < 590 && mouseY > 300 && mouseY < 325) {
		if (Matrizes.length > 0) {
			insertedMatrix(Matrizes[Matrizes.length - 1].numbers);
		}
	}

}

function setup() {
	canvas = createCanvas(600, 400);
	arrayCopy(id, id2);
	var d3 = [];
	arrayCopy(id, d3);
	Matrizes.push(new Matrix(id, height - 51));
	canvas.parent('holder');

}


function draw() {
	mainScreen();
	//console.log("X : " + mouseX + " Y : " + mouseY);
}