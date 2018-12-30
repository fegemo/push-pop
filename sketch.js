const dimensions = {
  width: 600,
  height: 600,
  minHorizontalMargin: 10,
  scaleFactor: 1
};
const matrixDimension = 4;
var xAxis = dimensions.width / 2;
var yAxis = dimensions.height / 2;
let matrixStack = [];
var numObj = 0;
var id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
var id2 = [];
var actual = 0;
var tam = 1;
var mulTam = 0.001;
var canvas;
let isModalOpen = false;
let buttonsFont = null;
let matrixFont = null;
let buttons = [];

class Button {
  constructor(text, region) {
    this.button = createButton(text);
    this.button.style("grid-area", region);
    this.button.style("font-size", `${dimensions.scaleFactor * 100}%`);
    this.button.mousePressed(this.execute.bind(this));
    this.button.mouseOver(this.showExplanation.bind(this));
    this.button.mouseOut(this.hideExplanation.bind(this));
    this.button.parent("#buttons-container");
  }

  showExplanation() {
    const { title, description, moreInfo } = this.getExplanation();
    const explanationEl = document.querySelector("#explanation");
    explanationEl.querySelector(".title").innerHTML = title;
    explanationEl.querySelector(".description").innerHTML = description;
    explanationEl.querySelector(
      ".more-info"
    ).innerHTML = `Mais informações: <a href="${moreInfo}" target="_blank">${moreInfo}</a>`;
    explanationEl.removeAttribute("hidden");
    explanationEl.classList.remove("invisible");
    explanationEl.onTransitionEnd = null;
  }

  hideExplanation() {
    const explanationEl = document.querySelector("#explanation");
    explanationEl.classList.add("invisible");
    explanationEl.onTransitionEnd = () =>
      explanationEl.setAttribute("hidden", true);
  }

  execute() {
    alert("Ainda não implementado");
  }

  configureBinding(matricesEl) {
    alert("Ainda não implementado");
  }

  getExplanation() {
    alert("Ainda não implementado");
  }
}

class PushMatrixButton extends Button {
  constructor(region) {
    super("glPushMatrix( )", region);
  }

  execute() {
    if (matrixStack.length === 0) {
      var d3 = [];
      arrayCopy(id2, d3);

      // the first matrix
      matrixStack.push(new Matrix(d3, dimensions.height - Matrix.size(4) / 2));
    } else if (matrixStack.length < 4) {
      if (matrixStack[matrixStack.length - 1].bot) {
        var d5 = [];
        arrayCopy(matrixStack[matrixStack.length - 1].numbers, d5);
        matrixStack.push(
          new Matrix(
            d5,
            matrixStack[matrixStack.length - 1].pos.y - Matrix.size(4) * 0.9
          )
        );
      }
    }
  }

  getExplanation() {
    return {
      title: "glPushMatrix();",
      description:
        "Clona a matriz que está no topo da pilha corrente e a empilha",
      moreInfo: "http://home.deec.uc.pt/~peixoto/eda/opengl/glPushMatrix.html"
    };
  }
}

class PopMatrixButton extends Button {
  constructor(region) {
    super("glPopMatrix( )", region);
  }

  execute() {
    matrixStack.splice(matrixStack.length - 1, 1);
  }

  getExplanation() {
    return {
      title: "glPopMatrix();",
      description:
        "Remove a matriz que está no topo da pilha corrente, voltando com a matriz anterior",
      moreInfo: "http://home.deec.uc.pt/~peixoto/eda/opengl/glPopMatrix.html"
    };
  }
}

class LoadMatrixButton extends Button {
  constructor(region) {
    super("glLoadMatrix(...)", region);
  }

  execute() {
    if (matrixStack.length > 0) {
      openMatrixModal(this, matrixStack[matrixStack.length - 1].numbers)
        .then(
          numbers => (matrixStack[matrixStack.length - 1].numbers = numbers)
        )
        .catch(() => {});
    }
  }

  configureBinding(generatedMatrixEl, operationParamsEl) {
    let ithParam = 0;
    let isConfigurable = this.getParams().configurableParams;
    for (let c = 0; c < matrixDimension * matrixDimension; c++) {
      if (isConfigurable & (1 << c)) {
        const matrixValueEl = generatedMatrixEl.querySelector(
          `.matrix-value:nth-of-type(${c + 1})`
        );
        const paramValueEl = operationParamsEl.querySelector(
          `.parameter:nth-of-type(${ithParam + 1})`
        );
        binder.bind(this.onParameterChanged, matrixValueEl, paramValueEl);

        ithParam++;
      }
    }
  }

  onParameterChanged() {
    // assembles a 1d array of the generated matrix
    const generated = Array.from(
      generatedMatrixEl.querySelectorAll(".matrix-value")
    ).map(el => parseFloat(el.value.trim() || "0"));
    // writes the 1d array result back into the resulting matrix
    const resultingEls = resultingMatrixEl.querySelectorAll(".matrix-value");
    resultingEls.forEach((el, i) => (el.value = resultsArray[i]));
  }

  getParams() {
    return {
      showLeftMatrix: false,
      showMiddleMatrix: true,
      showRightMatrix: false,
      configurableParams: 0b1111111111111111,
      openGLCommands: [
        "GLfloat mat[] = { @input:1, @input:0, @input:0, @input:0, @input:0, @input:1, @input:0, @input:0, @input:0, @input:0, @input:1, @input:0, @input:0, @input:0, @input:0, @input:1 };",
        "glLoadMatrixf(mat);"
      ]
    };
  }

  getExplanation() {
    return {
      title: "glLoadMatrix(float*);",
      description:
        "Carrega o array de 16 <code>floats</code> passado como parâmetro na matriz que está no topo da pilha de matrizes corrente",
      moreInfo: "http://home.deec.uc.pt/~peixoto/eda/opengl/glLoadMatrix.html"
    };
  }
}

class MultMatrixButton extends Button {
  constructor(text, region) {
    super(text, region);
  }

  execute() {
    if (matrixStack.length) {
      openMatrixModal(this, matrixStack[matrixStack.length - 1].numbers)
        .then(
          numbers => (matrixStack[matrixStack.length - 1].numbers = numbers)
        )
        .catch(() => {});
    }
  }

  configureBinding(generatedMatrixEl, operationParamsEl) {
    let ithParam = 0;
    let isConfigurable = this.getParams().configurableParams;
    for (let c = 0; c < matrixDimension * matrixDimension; c++) {
      if (isConfigurable & (1 << c)) {
        const matrixValueEl = generatedMatrixEl.querySelector(
          `.matrix-value:nth-of-type(${c + 1})`
        );
        const paramValueEl = operationParamsEl.querySelector(
          `.parameter:nth-of-type(${ithParam + 1})`
        );
        binder.bind(this.onParameterChanged, matrixValueEl, paramValueEl);

        ithParam++;
      }
    }
  }

  onParameterChanged() {
    const modalMatrixEl = document.querySelector("#modal-matrix");
    const currentMatrixEl = modalMatrixEl.querySelector("#mat-left");
    const generatedMatrixEl = modalMatrixEl.querySelector("#mat-top");
    const resultingMatrixEl = modalMatrixEl.querySelector("#mat-right");
    // assembles a 1d array of the current matrix
    const currents = Array.from(
      currentMatrixEl.querySelectorAll(".matrix-value")
    ).map(el => parseFloat(el.value.trim() || "0"));

    // assembles a 1d array of the generated matrix
    const generated = Array.from(
      generatedMatrixEl.querySelectorAll(".matrix-value")
    ).map(el => parseFloat(el.value.trim() || "0"));

    // executes the multiplication
    const resultsArray = MultMatrixButton.multiplyMatrices(currents, generated);

    // writes the 1d array result back into the resulting matrix
    const resultingEls = resultingMatrixEl.querySelectorAll(".matrix-value");
    resultingEls.forEach((el, i) => (el.value = resultsArray[i]));
  }

  static multiplyMatrices(left, right) {
    const asMatrix = (array, i, j) => array[j * matrixDimension + i];
    const setAsMatrix = (array, i, j, value) =>
      (array[j * matrixDimension + i] = value);
    const sumAsMatrix = (array, i, j, value) =>
      (array[j * matrixDimension + i] += value);
    const result = [];

    for (let j = 0; j < matrixDimension; j++) {
      for (let i = 0; i < matrixDimension; i++) {
        setAsMatrix(result, i, j, 0);

        for (let k = 0; k < matrixDimension; k++) {
          const leftValue = asMatrix(left, i, k);
          const rightValue = asMatrix(right, k, j);
          const value = leftValue * rightValue;
          sumAsMatrix(result, i, j, value);
        }
      }
    }

    return result;
  }

  getParams() {
    return {
      showLeftMatrix: true,
      showMiddleMatrix: true,
      showRightMatrix: true,
      configurableParams: 0b1111111111111111,
      openGLCommands: [
        "GLfloat mat[] = { @input:1, @input:0, @input:0, @input:0, @input:0, @input:1, @input:0, @input:0, @input:0, @input:0, @input:1, @input:0, @input:0, @input:0, @input:0, @input:1 };",
        "glMultMatrixf(mat);"
      ]
    };
  }

  getExplanation() {
    return {
      title: "glMultMatrix(float*);",
      description:
        "Multiplica a matriz que está no topo da pilha de matrizes corrente por uma matriz formada pelo array de 16 <code>floats</code> passado como parâmetro",
      moreInfo: "http://home.deec.uc.pt/~peixoto/eda/opengl/glMultMatrix.html"
    };
  }
}

class TranslateButton extends MultMatrixButton {
  constructor(region) {
    super("glTranslate(...)", region);
  }

  getParams() {
    return Object.assign({}, super.getParams(), {
      configurableParams: 0b111000000000000,
      openGLCommands: ["glTranslatef(@input:0, @input:0, @input:0);"]
    });
  }

  getExplanation() {
    return {
      title: "glTranslatef(float x, float y, float z);",
      description:
        "Gera uma matriz de translação e a multiplica à direita (<strong>pós multiplicação</strong>) da matriz que está no topo da pilha de matrizes corrente",
      moreInfo: "http://home.deec.uc.pt/~peixoto/eda/opengl/glTranslate.html"
    };
  }
}

class ScaleButton extends MultMatrixButton {
  constructor(region) {
    super("glScale(...)", region);
  }

  getParams() {
    return Object.assign({}, super.getParams(), {
      configurableParams: 0b000010000100001,
      openGLCommands: ["glScalef(@input:1, @input:1, @input:1);"]
    });
  }

  getExplanation() {
    return {
      title: "glScalef(float x, float y, float z);",
      description:
        "Gera uma matriz de escala e a multiplica à direita (<strong>pós multiplicação</strong>) da matriz que está no topo da pilha de matrizes corrente",
      moreInfo: "http://home.deec.uc.pt/~peixoto/eda/opengl/glScale.html"
    };
  }
}

class RotateButton extends MultMatrixButton {
  constructor(region) {
    super("glRotate(...)", region);
  }

  configureBinding(generatedMatrixEl, operationParamsEl) {
    const parameterEls = Array.from(
      operationParamsEl.querySelectorAll(".parameter")
    );
    const [angleEl, xEl, yEl, zEl] = parameterEls;
    const impactedGeneratedMatrixValueEls = Array.from(
      generatedMatrixEl.querySelectorAll(".matrix-value")
    ).filter(
      (_, i) =>
        i < matrixDimension * (matrixDimension - 1) &&
        (i + 1) % matrixDimension !== 0
    );

    binder.watchAndTransform(
      this.onParameterChanged,
      () => {
        const parameters = parameterEls.map(el => parseFloat(el.value || "0"));

        // gets the angle and the xyz rotation axis
        let [angle, ...rotationAxis] = parameters;
        // finds the norm
        const rotationAxisNormSquared = rotationAxis.reduce(
          (accum, n) => accum + n * n,
          0
        );
        const rotationAxisNorm =
          rotationAxisNormSquared > 0 ? Math.sqrt(rotationAxisNormSquared) : 0;

        // normalizes the axis
        if (rotationAxisNorm) {
          rotationAxis = rotationAxis.map(d => d / rotationAxisNorm);
        }

        // defines the new value for each matrix element according to
        // the euler rotation matrix (http://www.dei.isep.ipp.pt/~matos/cg/docs/manual/glRotate.3G.html)
        angle *= Math.PI / 180;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const [x, y, z] = rotationAxis;

        let matrixValues = [
          x ** 2 * (1 - cosine) + cosine,
          y * x * (1 - cosine) + z * cosine,
          x * z * (1 - cosine) - y * sine,
          x * y * (1 - cosine) - z * sine,
          y ** 2 * (1 - cosine) + cosine,
          y * z * (1 - cosine) + x * sine,
          x * z * (1 - cosine) + y * sine,
          y * z * (1 - cosine) - x * sine,
          z ** 2 * (1 - cosine) + cosine
        ];

        // checks if number is too close to zero... if it is, sets to 0
        matrixValues = matrixValues.map(v =>
          Math.abs(v) < Number.EPSILON ? 0 : v
        );

        // changes the values of the elements in the upper-left submatrix
        impactedGeneratedMatrixValueEls.forEach(
          (el, i) => (el.value = matrixValues[i])
        );
      },
      ...parameterEls,
      ...impactedGeneratedMatrixValueEls
    );
  }

  getParams() {
    return Object.assign({}, super.getParams(), {
      configurableParams: 0b0,
      openGLCommands: ["glRotatef(@input:0, @input:0, @input:0, @input:1);"]
    });
  }

  getExplanation() {
    return {
      title: "glRotatef(float alpha, float x, float y, float z);",
      description:
        "Gera uma matriz de rotação dada por um ângulo e um eixo de rotação e a multiplica à direita (<strong>pós multiplicação</strong>) da matriz que está no topo da pilha de matrizes corrente",
      moreInfo: "http://home.deec.uc.pt/~peixoto/eda/opengl/glRotate.html"
    };
  }
}

class DisabledButton extends Button {
  constructor(text, region) {
    super(text, region);
    this.button.disabled();
  }
}

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
      left: this.pos.x - (this.size / 2) * Matrix.characterSpacing,
      right: this.pos.x + (this.size / 2) * Matrix.characterSpacing,
      top: this.pos.y - (this.size / 2) * Matrix.characterSpacing - 10,
      bottom: this.pos.y + (this.size / 2) * Matrix.characterSpacing - 10
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
    rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );
    rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      5,
      this.size * Matrix.characterSpacing
    );
    rect(
      x - (this.size / 2) * Matrix.characterSpacing,
      y + (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );

    // right brackets
    rect(
      x + 5 + (this.size / 2) * Matrix.characterSpacing - 22,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      17,
      5
    );
    rect(
      x + (this.size / 2) * Matrix.characterSpacing,
      y - (this.size / 2) * Matrix.characterSpacing - 10,
      5,
      this.size * Matrix.characterSpacing
    );
    rect(
      x + 5 + (this.size / 2) * Matrix.characterSpacing - 22,
      y + (this.size / 2) * Matrix.characterSpacing - 10,
      22,
      5
    );
    stroke(0);

    // numbers
    textAlign(CENTER);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const posX = x + Matrix.characterSpacing * (j - (this.size - 1) / 2);
        const posY = y + Matrix.characterSpacing * (i - (this.size - 1) / 2);
        text(this.numbers[i + j * this.size], posX, posY);
      }
    }
    textAlign(LEFT);
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

function cloud(x, y, tam) {
  push();
  noStroke();
  fill(255, 255, 255, 200);
  ellipse(x, y + 20, 100 * tam, 50 * tam);
  ellipse(x + 50, y + 20, 100 * tam, 50 * tam);
  ellipse(x + 25, y, 80 * tam, 50 * tam);

  pop();
}

function mainScreen() {
  scale(dimensions.scaleFactor);
  background(255, 255, 233, 80);
  background(0, 191, 255, 200);
  tam += mulTam;
  if (tam >= 1.1 || tam <= 0.9) {
    mulTam *= -1;
  }
  cloud(100, 180, tam);
  cloud(400, 100, tam * 1.05);
  push();
  noStroke();
  fill(100, 255, 100);
  rect(0, dimensions.height - 50, dimensions.width, 50);
  pop();

  if (matrixStack.length > 0) {
    text(
      "Atual",
      matrixStack[matrixStack.length - 1].pos.x + Matrix.size(4) * 0.5,
      matrixStack[matrixStack.length - 1].pos.y
    );
  }

  textFont(matrixFont);
  strokeWeight(1);
  for (let i = matrixStack.length - 1; i >= 0; i--) {
    if (!matrixStack[i].bot) {
      matrixStack[i].drop();
    }
    matrixStack[i].draw();
  }
}

function setup() {
  // determines the size of the canvas so it fits smaller screens nicely
  if (windowWidth >= 320 && windowWidth <= dimensions.width) {
    const desiredAspectRatio = dimensions.width / dimensions.height;
    canvas = createCanvas(
      windowWidth - dimensions.minHorizontalMargin * 2,
      (windowWidth - dimensions.minHorizontalMargin * 2) * desiredAspectRatio
    );
    dimensions.scaleFactor =
      (windowWidth - dimensions.minHorizontalMargin * 2) / dimensions.width;
  } else {
    canvas = createCanvas(dimensions.width, dimensions.height);
    dimensions.scaleFactor = 1;
  }

  arrayCopy(id, id2);
  var d3 = [];
  arrayCopy(id, d3);
  matrixStack.push(
    new Matrix(id, dimensions.height - Matrix.size(matrixDimension) / 2)
  );
  canvas.id("main-canvas").parent("#canvas-container");

  // creates buttons
  let buttons = [
    new PushMatrixButton("bottom-right-5"),
    new PopMatrixButton("bottom-right-6"),
    new TranslateButton("bottom-left-1"),
    new ScaleButton("bottom-left-2"),
    new RotateButton("bottom-left-3"),
    new LoadMatrixButton("bottom-left-5"),
    new MultMatrixButton("glMultMatrix(...)", "bottom-left-6")
  ];
}

function windowResized() {
  if (windowWidth >= 320 && windowWidth <= dimensions.width) {
    const desiredAspectRatio = dimensions.width / dimensions.height;
    resizeCanvas(
      windowWidth - dimensions.minHorizontalMargin * 2,
      (windowWidth - dimensions.minHorizontalMargin * 2) / desiredAspectRatio,
      false
    );
  }

  dimensions.scaleFactor = Math.min(
    1,
    (windowWidth - dimensions.minHorizontalMargin * 2) / dimensions.width
  );

  buttons.forEach(b => {
    b.button.position(x * dimensions.scaleFactor, y * dimensions.scaleFactor);
    b.button.style("font-size", `${dimensions.scaleFactor * 100}%`);
  });
}

function draw() {
  mainScreen();
}

function preload() {
  buttonsFont = "sans-serif";
  matrixFont = "Abel, sans-serif";
}
