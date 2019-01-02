import {
  PushMatrixButton,
  PopMatrixButton,
  TranslateButton,
  ScaleButton,
  RotateButton,
  LoadMatrixButton,
  MultMatrixButton
} from "./buttons.js";
import Matrix from "./matrix.js";
import Cloud from "./cloud.js";
import { dimensions, matrixDimension, matrixStack } from "./config.js";
import dragger from "./number-dragger.js";
import resizer from "./input-autosizer.js";
import sound from "./sound.js";

new p5(p5 => {
  let clouds = [];
  let canvas;
  let isModalOpen = false;
  let buttonsFont = null;
  let matrixFont = null;
  let buttons = [];

  const mainScreen = () => {
    let deltaTime = window.performance.now() - canvas._pInst._lastFrameTime;

    p5.scale(dimensions.scaleFactor);
    p5.background(255, 255, 233, 80);
    p5.background(0, 191, 255, 200);

    clouds.forEach(c => c.update(deltaTime));
    clouds.forEach(c => c.draw(p5));

    p5.push();
    p5.noStroke();
    p5.fill(100, 255, 100);
    p5.rect(0, dimensions.height - 50, dimensions.width, 50);
    p5.pop();

    // draws the "current" word next to the top-most matrix
    const topMatrix = matrixStack[matrixStack.length - 1];
    p5.text(
      "Atual",
      topMatrix.pos.x + Matrix.size(matrixDimension) * 0.5,
      topMatrix.pos.y
    );

    p5.textFont(matrixFont);
    p5.strokeWeight(1);
    for (let matrix of matrixStack) {
      if (!matrix.bot) {
        matrix.drop();
      }
      matrix.draw();
    }
  };

  p5.setup = () => {
    // determines the size of the canvas so it fits smaller screens nicely
    if (p5.windowWidth >= 320 && p5.windowWidth <= dimensions.width) {
      const desiredAspectRatio = dimensions.width / dimensions.height;
      canvas = p5.createCanvas(
        p5.windowWidth - dimensions.minHorizontalMargin * 2,
        (p5.windowWidth - dimensions.minHorizontalMargin * 2) *
          desiredAspectRatio
      );
      dimensions.scaleFactor =
        (p5.windowWidth - dimensions.minHorizontalMargin * 2) /
        dimensions.width;
    } else {
      canvas = p5.createCanvas(dimensions.width, dimensions.height);
      dimensions.scaleFactor = 1;
    }

    // adds the initial matrix as an identity
    matrixStack.push(
      new Matrix(
        p5,
        Matrix.identity(matrixDimension),
        dimensions.height - Matrix.size(matrixDimension) / 2
      )
    );

    // creates some clouds
    clouds.push(new Cloud(100, 180));
    clouds.push(new Cloud(400, 100));

    // appends the canvas to its respective parent in the DOM
    canvas.id("main-canvas").parent("#canvas-container");

    // creates buttons to interact with the matrix stack
    buttons = [
      new PushMatrixButton(p5, "bottom-right-5"),
      new PopMatrixButton(p5, "bottom-right-6"),
      new TranslateButton(p5, "bottom-left-1"),
      new ScaleButton(p5, "bottom-left-2"),
      new RotateButton(p5, "bottom-left-3"),
      new LoadMatrixButton(p5, "bottom-left-5"),
      new MultMatrixButton(p5, "glMultMatrix(...)", "bottom-left-6")
    ];

    const modalMatrixEl = document.querySelector("#modal-matrix");
    dragger.bind(
      modalMatrixEl,
      ".matrix-value:not(:disabled), .parameter",
      0.1
    );
    resizer.bind(modalMatrixEl, ".parameter");
    sound.preload(
      ["hover.mp3", "pop.mp3", "push-end.mp3", "falling.mp3"].map(n => "../sound/" + n)
    );
  };

  p5.windowResized = () => {
    if (p5.windowWidth >= 320 && p5.windowWidth <= dimensions.width) {
      const desiredAspectRatio = dimensions.width / dimensions.height;
      p5.resizeCanvas(
        p5.windowWidth - dimensions.minHorizontalMargin * 2,
        (p5.windowWidth - dimensions.minHorizontalMargin * 2) /
          desiredAspectRatio,
        false
      );
    }

    dimensions.scaleFactor = Math.min(
      1,
      (p5.windowWidth - dimensions.minHorizontalMargin * 2) / dimensions.width
    );
  };

  p5.draw = () => {
    mainScreen();
  };

  p5.preload = () => {
    buttonsFont = "sans-serif";
    matrixFont = "Abel, sans-serif";
  };
});
