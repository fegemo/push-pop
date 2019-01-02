import Matrix from "./matrix.js";
import openMatrixModal from "./modal.js";
import binder from "./binder.js";
import {
  dimensions,
  matrixDimension,
  matrixStack,
  maxMatrices
} from "./config.js";
import sound from "./sound.js";

const isModalOpen = () => {
  return document.body.classList.contains("modal-open");
};

class Button {
  constructor(p5, text, region) {
    this.p5 = p5;
    this.button = p5.createButton(text);
    this.button.style("grid-area", region);
    this.button.mouseClicked(() => {
      this.showExplanation();
      this.execute();
    });
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
    sound.play("hover.mp3", 0, 0.25);
  }

  hideExplanation() {
    if (!isModalOpen()) {
      const explanationEl = document.querySelector("#explanation");
      explanationEl.classList.add("invisible");
      explanationEl.onTransitionEnd = () =>
        explanationEl.setAttribute("hidden", true);
    }
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

export class PushMatrixButton extends Button {
  constructor(p5, region) {
    super(p5, "glPushMatrix( )", region);
  }

  execute() {
    if (matrixStack.length < maxMatrices) {
      const topMatrix = matrixStack[matrixStack.length - 1];
      const soundBegin = (matrixStack.length - 1) / maxMatrices;
      sound.play("falling.mp3", soundBegin, 0.5);
      if (topMatrix.bot) {
        const clonedMatrix = new Matrix(
          this.p5,
          topMatrix.numbers.slice(),
          topMatrix.pos.y - Matrix.size(4) * 0.9
        );
        clonedMatrix.registerDropped(() => {
          sound.stop("falling.mp3");
          sound.play("push-end.mp3", 0, 0.15);
        });
        matrixStack.push(clonedMatrix);
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

export class PopMatrixButton extends Button {
  constructor(p5, region) {
    super(p5, "glPopMatrix( )", region);
  }

  execute() {
    if (matrixStack.length > 1) {
      matrixStack.splice(matrixStack.length - 1, 1);
      sound.play("pop.mp3", 0, 0.15);
    }
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

export class LoadMatrixButton extends Button {
  constructor(p5, region) {
    super(p5, "glLoadMatrix(...)", region);
  }

  execute() {
    const topMatrix = matrixStack[matrixStack.length - 1];
    openMatrixModal(this, topMatrix.numbers)
      .then(numbers => (topMatrix.numbers = numbers))
      .catch(() => {});
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
    const generatedMatrixEl = modalMatrixEl.querySelector("#mat-top");
    const resultingMatrixEl = modalMatrixEl.querySelector("#mat-right");
    // assembles a 1d array of the generated matrix
    const generated = Array.from(
      generatedMatrixEl.querySelectorAll(".matrix-value")
    ).map(el => parseFloat(el.value.trim() || "0"));
    // writes the 1d array result back into the resulting matrix
    const resultingEls = resultingMatrixEl.querySelectorAll(".matrix-value");
    resultingEls.forEach((el, i) => (el.value = generated[i]));
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

export class MultMatrixButton extends Button {
  constructor(p5, text, region) {
    super(p5, text, region);
  }

  execute() {
    const topMatrix = matrixStack[matrixStack.length - 1];
    openMatrixModal(this, topMatrix.numbers)
      .then(numbers => (topMatrix.numbers = numbers))
      .catch(() => {});
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

export class TranslateButton extends MultMatrixButton {
  constructor(p5, region) {
    super(p5, "glTranslate(...)", region);
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

export class ScaleButton extends MultMatrixButton {
  constructor(p5, region) {
    super(p5, "glScale(...)", region);
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

export class RotateButton extends MultMatrixButton {
  constructor(p5, region) {
    super(p5, "glRotate(...)", region);
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
          (accum, n) => accum + n ** 2,
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
