import { dimensions, matrixDimension } from "./config.js";
import binder from "./binder.js";

const modalMatrixEl = document.querySelector("#modal-matrix");
const currentMatrixEl = modalMatrixEl.querySelector("#mat-left");
const generatedMatrixEl = modalMatrixEl.querySelector("#mat-top");
const resultingMatrixEl = modalMatrixEl.querySelector("#mat-right");

const autoSelectContents = e => {
  const el = e.currentTarget;
  // for desktops
  el.select();

  // for mobile
  if ("ontouchstart" in window) {
    setTimeout(() => {
      try {
        el.setSelectionRange(0, el.value.length);
      } catch (err) {
        // simply ignores the error... some browsers do not accept
        // setSelectionRange on input[type="number"]s
      }
    }, 1);
  }
};

const keyPress = e => {
  const key = e.keyCode || e.which;

  // checks for 'Enter'
  const ENTER = 13;
  if (key === ENTER) {
    const focusedEl = document.activeElement;

    // checks if the focus within an element which is inside the modal
    if (modalMatrixEl.contains(focusedEl)) {
      // if it's a button or link, 'Enter' should not be prevented
      if (!["button", "a"].includes(focusedEl.tagName.toLowerCase())) {
        e.preventDefault();
        simulateTab(focusedEl);
      }
    }
  }
};

const popStater = closer => {
  const popStateCallback = e => {
    closer({
      currentTarget: window,
      type: "popstate"
    });
    window.removeEventListener("popstate", popStateCallback);
  };

  return popStateCallback;
};

const simulateTab = targetEl => {
  //finds all tab-able elements inside the modal
  const focusableEls = modalMatrixEl.querySelectorAll(
    "input:not(:disabled), button, a"
  );

  // finds the current tab index
  const currentIndex = Array.from(focusableEls).findIndex(
    el => targetEl === el
  );

  // focuses the following element
  focusableEls[currentIndex + 1].focus();
};

const clearModalMatrices = currentMatrix => {
  let currents = Array.from(currentMatrixEl.querySelectorAll(".matrix-value"));
  let generated = Array.from(
    generatedMatrixEl.querySelectorAll(".matrix-value")
  );
  let resulting = Array.from(
    resultingMatrixEl.querySelectorAll(".matrix-value")
  );
  let parameters = Array.from(modalMatrixEl.querySelectorAll(".parameter"));

  // sets the value of the current matrix
  currents.forEach((el, i) => (el.value = currentMatrix[i]));

  // loads an identity as the generated matrix (initially)
  generated.forEach(
    (el, i) => (el.value = i % (matrixDimension + 1) === 0 ? 1 : 0)
  );

  // unbinds previous bindings from one input to another
  binder.unbind(...currents, ...generated, ...resulting, ...parameters);

  // disables all inputs
  modalMatrixEl.querySelectorAll(".matrix-value").forEach(el => {
    el.setAttribute("disabled", true);
    el.removeEventListener("focus", autoSelectContents);
  });

  const enabledInputEls = Array.from(
    modalMatrixEl.querySelectorAll(
      "input.matrix-value:not(:disabled), input.parameter"
    )
  );
};

const openModalEffect = (operation, currentMatrix) => {
  const canvasLimits = operation.canvasEl.getBoundingClientRect();
  // debugger;
  // get the position and dimension of the matrix in the canvas in the viewport
  let canvasMatrixLimits = currentMatrix.limits();
  canvasMatrixLimits = Object.keys(canvasMatrixLimits).reduce((prev, curr) => {
    prev[curr] *= dimensions.scaleFactor;
    return prev;
  }, canvasMatrixLimits);
  canvasMatrixLimits.top = canvasMatrixLimits.top + canvasLimits.top;


  return new Promise(resolve => {
    // get the target position and dimension of the matrix in the modal
    const dialogEl = modalMatrixEl.querySelector(".modal-dialog");
    modalMatrixEl.style.display = "block";
    const vertical = canvasMatrixLimits.top / window.innerHeight;
    dialogEl.style.transition = "none";
    dialogEl.style.transformOrigin = `50% ${vertical*100}%`;
    dialogEl.style.transform = `scale(${0.2})`;
    const transitionDuration = 200;

    setTimeout(() => {
      modalMatrixEl.classList.add("in");
      dialogEl.style.transition = `transform ${transitionDuration}ms ease-out`;

      setTimeout(() => {
        dialogEl.style.transform = `scale(1)`;
        setTimeout(() => {
          const modalTargetMatrixLimits = modalMatrixEl
          .querySelector("#current-matrix")
          .getBoundingClientRect();

          modalMatrixEl.classList.add("finished");
          setTimeout(() => {

            modalMatrixEl.classList.add("totally-finished");
            resolve();
          }, transitionDuration);
        }, transitionDuration);
      }, 10);
    }, 10);
  });
};

export default async function openMatrixModal(operation, currentMatrix) {
  const numbers = currentMatrix.numbers;
  document.body.classList.add("modal-open");
  document.body.addEventListener("keydown", keyPress);
  history.pushState({}, null, "");

  // resets the modal to its defaults
  clearModalMatrices(numbers);

  // sets up the visibility of the matrices inside the modal
  const params = operation.getParams();
  currentMatrixEl.classList.toggle("invisible", !params.showLeftMatrix);
  modalMatrixEl
    .querySelector("#current-matrix")
    .classList.toggle("invisible", !params.showLeftMatrix);
  generatedMatrixEl.classList.toggle("invisible", !params.showMiddleMatrix);
  modalMatrixEl
    .querySelector("#generated-matrix")
    .classList.toggle("invisible", !params.showMiddleMatrix);
  resultingMatrixEl.classList.toggle("invisible", !params.showRightMatrix);
  modalMatrixEl
    .querySelector("#resulting-matrix")
    .classList.toggle("invisible", !params.showRightMatrix);

  modalMatrixEl
    .querySelector("#matrices")
    .classList.toggle(
      "single-matrix",
      !params.showLeftMatrix &&
        params.showMiddleMatrix &&
        !params.showRightMatrix
    );
  const matrixWithResultsEl = modalMatrixEl
    .querySelector("#matrices")
    .classList.contains("single-matrix")
    ? generatedMatrixEl
    : resultingMatrixEl;

  // configures the parameter and OpenGL commands section of the modal
  const paramsEl = modalMatrixEl.querySelector("#operation-params");
  paramsEl.innerHTML = `<pre><code>${params.openGLCommands
    .map(c => input(c))
    .join("\n")}</code></pre>`;
  for (let c = 0; c < matrixDimension * matrixDimension; c++) {
    // enables only the matrices elements that can be changed directly by
    // this operation
    if (params.configurableParams & (1 << c)) {
      generatedMatrixEl
        .querySelector(".mat")
        .querySelector(`.matrix-value:nth-of-type(${c + 1})`)
        .removeAttribute("disabled");
    }
  }

  // configures the binding of the command parameters and the matrix
  operation.configureBinding(
    generatedMatrixEl.querySelector(".mat"),
    modalMatrixEl.querySelector("#operation-params")
  );

  // makes input auto select all text when focused
  const enabledInputEls = Array.from(
    modalMatrixEl.querySelectorAll(
      "input.matrix-value:not(:disabled), input.parameter"
    )
  );
  enabledInputEls.forEach(el =>
    el.addEventListener("focus", autoSelectContents)
  );

  // effectively shows the modal
  modalMatrixEl.style.display = "block";
  await openModalEffect(operation, currentMatrix);

  // utility functions used inside the modal
  function input(line) {
    return line.replace(
      /@input\:([+-]?\d+(\.\d+)?)/g,
      '<input type="number" class="parameter float-parameter" value="$1" placeholder="0">'
    );
  }

  function getValue(id) {
    return parseFloat(modalMatrixEl.querySelector(id).value);
  }

  // a promise that is resolved when the modal is closed either by "okaying"
  // or dismissing it (reject)
  return new Promise((resolve, reject) => {
    let matrix = numbers;

    const modalOkEl = modalMatrixEl.querySelector("#matrix-ok");
    const modalCloseEls = [
      ...modalMatrixEl.querySelectorAll(".close"),
      ...modalMatrixEl.querySelectorAll(".modal-mask")
    ];

    let closeModal = e => {
      // removes the click handler, as it is
      e.currentTarget.removeEventListener("click", okHandler);
      document.body.removeEventListener("keydown", keyPress);
      if (e.type !== "popstate") {
        history.go(-1);
      }

      modalCloseEls.forEach(el =>
        el.removeEventListener("click", closeHandler)
      );

      // triggers the closing animation
      modalMatrixEl.classList.remove("totally-finished");
      modalMatrixEl.classList.remove("finished");
      modalMatrixEl.classList.remove("in");
      setTimeout(() => {
        modalMatrixEl.style.display = "none";
        document.body.classList.remove("modal-open");
      }, 500);
    };

    const okHandler = e => {
      // sets the value of the currentMatrix as the resulting one
      matrix = Array.from(
        matrixWithResultsEl.querySelectorAll(".matrix-value")
      ).map(el => parseFloat(el.value));

      // and resolves the promise with the result
      resolve(matrix);

      closeModal(e);
    };

    const closeHandler = e => {
      closeModal(e);

      // rejects the promise to whom opened this modal
      reject();
    };

    const popStated = popStater(closeHandler);
    window.addEventListener("popstate", popStated);
    modalOkEl.addEventListener("click", okHandler);
    modalCloseEls.forEach(el => el.addEventListener("click", closeHandler));
  });
}
