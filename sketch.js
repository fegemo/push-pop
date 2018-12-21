const dimensions = {
	width: 600,
	height: 600
};
var xAxis = dimensions.width / 2;
var yAxis = dimensions.height / 2;
var Matrizes = [];
var numObj = 0;
var id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var id2 = [];
var actual = 0;
var tam = 1;
var mulTam = 0.001;
var canvas;

class Button {
	constructor(text, x, y, width, height) {
		this.text = text;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	draw() {
		if (this.hover) {
			strokeWeight(2);
		}
		stroke(0, 0, 0);
		rect(this.x, this.y, this.width, this.height);
		textSize(15);
		text(this.text, this.x + 5, this.y + 20);

		if (this.hover) {
			strokeWeight(1);
		}
	}

	mouseover() {
		this.hover = true;
	}

	mouseout() {
		this.hover = false;
	}

	isPointWithin(x, y) {
		return this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y;
	}

	execute() {
		alert('Ainda não implementado');
	}
}

class PushMatrixButton extends Button {
	constructor(x, y, width, height) {
		super('glPushMatrix( )', x, y, width, height);
	}

	execute() {
		if (Matrizes.length === 0) {
			var d3 = [];
			arrayCopy(id2, d3);

			// the first matrix
			Matrizes.push(new Matrix(d3, dimensions.height - Matrix.size(4)/2));
		} else if (Matrizes.length < 4) {
			if (Matrizes[Matrizes.length - 1].bot) {
				var d5 = [];
				arrayCopy(Matrizes[Matrizes.length - 1].numbers, d5);
				Matrizes.push(new Matrix(d5, ((Matrizes[Matrizes.length - 1]).pos.y) - Matrix.size(4) * 0.9));
			}
		}
	}
}

class PopMatrixButton extends Button {
	constructor(x, y, width, height) {
		super('glPopMatrix( )', x, y, width, height);
	}

	execute() {
		Matrizes.splice(Matrizes.length - 1, 1);
	}
}

class LoadMatrixButton extends Button {
	constructor(x, y, width, height) {
		super('glLoadMatrix(...)', x, y, width, height);
	}

	execute() {
		if (Matrizes.length > 0) {
			openMatrixModal(this, Matrizes[Matrizes.length - 1].numbers)
				.then(numbers => Matrizes[Matrizes.length - 1].numbers = numbers)
				.catch(() => {});
		}
	}

	getParams() {
		return {
			showLeftMatrix: false,
			showMiddleMatrix: true,
			showRightMatrix: false,
			params: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			openGLCommands: [
				'GLfloat mat[] = { @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input };',
				'glLoadMatrixf(mat);'
			]
		};
	}
}

class MultMatrixButton extends Button {
	constructor(text, x, y, width, height) {
		super(text, x, y, width, height);
	}

	execute() {
		if (Matrizes.length) {
			openMatrixModal(this, Matrizes[Matrizes.length - 1].numbers)
				.then(numbers => Matrizes[Matrizes.length - 1].numbers = numbers)
				.catch(() => {});

		}
	}

	getParams() {
		return {
			showLeftMatrix: true,
			showMiddleMatrix: true,
			showRightMatrix: true,
			params: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
			openGLCommands: [
				'GLfloat mat[] = { @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input, @input };',
				'glMultMatrixf(mat);'
			]
		};
	}
}

class TranslateButton extends MultMatrixButton {
	constructor(x, y, width, height) {
		super('glTranslate(...)', x, y, width, height);
	}

	getParams() {
		return Object.assign({}, super.getParams(), {
			params: [false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, false],
			openGLCommands: ['glTranslatef(@input, @input, @input)']
		});
	}
}

class DisabledButton extends Button {
	constructor(text, x, y, width, height) {
		super(text, x, y, width, height)
	}

	draw() {
		stroke(0, 0, 0);
		// fill(100, 100, 100);
		rect(this.x, this.y, this.width, this.height);
		// fill(255, 255, 255);
		textSize(15);
		text(this.text, this.x + 5, this.y + 20);
		// fill(0, 0, 0);
	}
}

let buttons = [
	new PushMatrixButton(455, dimensions.height - 80, 112, 25),
	new PopMatrixButton(455, dimensions.height - 50, 105, 25),
	new TranslateButton(35, dimensions.height - 180, 110, 25),
	new DisabledButton('glScale(...)', 35, dimensions.height - 150, 90, 25),
	new DisabledButton('glRotate(...)', 35, dimensions.height -120, 90, 25),
	new LoadMatrixButton(35, dimensions.height - 80, 120, 25),
	new MultMatrixButton('glMultMatrix(...)', 35, dimensions.height - 50, 115, 25)
];

class Matrix {
	constructor(numbers, bottomLimit) {
		this.numbers = numbers;
		this.pos = createVector(xAxis, 0);
		this.vel = createVector(0, 0);
		this.acc = createVector(0, 0.5);
		this.bot = false;
		this.bottomLimit = bottomLimit;
		this.size = Math.floor(Math.sqrt(numbers.length));
	}

	limits() {
		return {
			left: this.pos.x - this.size / 2 * Matrix.characterSpacing,
			right: this.pos.x + this.size / 2 * Matrix.characterSpacing,
			top: this.pos.y - this.size/2 * Matrix.characterSpacing - 10,
			bottom: this.pos.y + this.size/2 * Matrix.characterSpacing - 10
		};
	}

	static get characterSpacing() {
		return 30;
	}

	static size(s) {
		return s * Matrix.characterSpacing + 20;
	}

	draw() {
		noStroke();

		let x = this.pos.x;
		let y = this.pos.y;

		// left brackets
		rect(x - this.size/2 * Matrix.characterSpacing, y - this.size/2 * Matrix.characterSpacing - 10, 22, 5);
		rect(x - this.size/2 * Matrix.characterSpacing, y - this.size/2 * Matrix.characterSpacing - 10, 5, this.size * Matrix.characterSpacing);
		rect(x - this.size/2 * Matrix.characterSpacing, y + this.size/2 * Matrix.characterSpacing - 10, 22, 5);

		// right brackets
		rect(x + this.size/2 * Matrix.characterSpacing - 22, y - this.size/2 * Matrix.characterSpacing - 10, 22, 5);
		rect(x + this.size/2 * Matrix.characterSpacing, y - this.size/2 * Matrix.characterSpacing - 10, 5, this.size * Matrix.characterSpacing);
		rect(x + this.size/2 * Matrix.characterSpacing - 22, y + this.size/2 * Matrix.characterSpacing - 10, 27, 5);
		stroke(0);

		// numbers
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				const posX = x + (Matrix.characterSpacing * (j - (this.size-1)/2));
				const posY = y + (Matrix.characterSpacing * (i - (this.size-1)/2));
				text(this.numbers[i * this.size + j], posX, posY);
			}
		}
	}

	drop() {
		if (this.pos.y < this.bottomLimit - 8) {
			this.pos.y += this.vel.y;
			this.vel.y += this.acc.y;

			return true;
		} else {
			this.bot = true;
			this.pos.y = this.bottomLimit - 8;
			return false;
		}
	}
}

function ButtonPush() {
	stroke(0, 0, 0);
	rect(35, 350, 112, 25);
	textSize(15);
	text("glPushMatrix( )", 41, 367);
}

function ButtonPop() {
	stroke(0, 0, 0);
	rect(455, 350, 105, 25);
	textSize(15);
	text("glPopMatrix( )", 461, 367);
}

function ButtonChangeMatrix() {
	stroke(0, 0, 0);
	rect(455, 350, 105, 25);
	rect(455, 300, 120, 25);
	textSize(15);
	text("glLoadMatrix(...)", 461, 320);
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
	cloud(100, 180);
	cloud(400, 100);
	tam += mulTam;
	if (tam >= 1.1 || tam <= 0.9) {
		mulTam *= -1;
	}
	push();
	noStroke();
	fill(100, 255, 100);
	rect(0, height - 50, width, 50);
	pop();

	for (button of buttons) {
		button.draw();
	}

	if (Matrizes.length > 0) {
		text("Atual", Matrizes[Matrizes.length - 1].pos.x + Matrix.size(4) * 0.5, Matrizes[Matrizes.length - 1].pos.y);
	}
	for (var i = Matrizes.length - 1; i >= 0; i--) {
		if (!Matrizes[i].bot) {
			Matrizes[i].drop();
		}
		Matrizes[i].draw();
	}
}

// function insertedMatrix(matrix) {
// 	matrix[0] = document.getElementById("r1c1").value;
// 	matrix[1] = document.getElementById("r1c2").value;
// 	matrix[2] = document.getElementById("r1c3").value;
// 	matrix[3] = document.getElementById("r1c4").value;
//
// 	matrix[4] = document.getElementById("r2c1").value;
// 	matrix[5] = document.getElementById("r2c2").value;
// 	matrix[6] = document.getElementById("r2c3").value;
// 	matrix[7] = document.getElementById("r2c4").value;
//
// 	matrix[8] = document.getElementById("r3c1").value;
// 	matrix[9] = document.getElementById("r3c2").value;
// 	matrix[10] = document.getElementById("r3c3").value;
// 	matrix[11] = document.getElementById("r3c4").value;
//
// 	matrix[12] = document.getElementById("r4c1").value;
// 	matrix[13] = document.getElementById("r4c2").value;
// 	matrix[14] = document.getElementById("r4c3").value;
// 	matrix[15] = document.getElementById("r4c4").value;
// }

function mouseClicked() {
	for (button of buttons) {
		if (button.isPointWithin(mouseX, mouseY)) {
			button.execute();
		}
	}
}

function mouseMoved() {
	for (button of buttons) {
		if (button.isPointWithin(mouseX, mouseY)) {
			button.mouseover();
		} else {
			button.mouseout();
		}
	}
}

function setup() {
	canvas = createCanvas(dimensions.width, dimensions.height);
	arrayCopy(id, id2);
	var d3 = [];
	arrayCopy(id, d3);
	Matrizes.push(new Matrix(id, dimensions.height - Matrix.size(4)/2));
	canvas.parent('holder');
}


function draw() {
	mainScreen();
}
