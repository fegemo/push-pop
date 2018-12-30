function clearModalMatrices(currentMatrix) {
  const modalMatrixEl = document.querySelector("#modal-matrix");
  const currentMatrixEl = modalMatrixEl.querySelector("#mat-left");
  const generatedMatrixEl = modalMatrixEl.querySelector("#mat-top");
  const resultingMatrixEl = modalMatrixEl.querySelector("#mat-right");

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
  modalMatrixEl
    .querySelectorAll(".matrix-value")
    .forEach(el => el.setAttribute("disabled", true));
}

function openMatrixModal(operation, currentMatrix) {
  isModalOpen = true;
  const modalMatrixEl = document.querySelector("#modal-matrix");
  const currentMatrixEl = modalMatrixEl.querySelector("#mat-left");
  const generatedMatrixEl = modalMatrixEl.querySelector("#mat-top");
  const resultingMatrixEl = modalMatrixEl.querySelector("#mat-right");

  // resets the modal to its defaults
  clearModalMatrices(currentMatrix);

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

  // effectively shows the modal
  modalMatrixEl.style.display = "block";
  setTimeout(() => {
    modalMatrixEl.classList.add("in");
  }, 10);

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
    let matrix = currentMatrix;

    const modalOkEl = modalMatrixEl.querySelector("#matrix-ok");
    const modalCloseEls = [...modalMatrixEl.querySelectorAll(".close"), ...modalMatrixEl.querySelectorAll(".modal-mask")];

    let closeModal = e => {
      // removes the click handler, as it is
      e.currentTarget.removeEventListener("click", okHandler);
      modalCloseEls.forEach(el => el.removeEventListener("click", closeHandler));

      // triggers the closing animation
      modalMatrixEl.classList.remove("in");
      setTimeout(() => {
        modalMatrixEl.style.display = "none";
        isModalOpen = false;
      }, 500);
    };

    const okHandler = e => {
      // sets the value of the currentMatrix as the resulting one
      matrix = Array.from(
        modalMatrixEl.querySelectorAll("#mat-right .matrix-value")
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

    modalOkEl.addEventListener("click", okHandler);
    modalCloseEls.forEach(el => el.addEventListener("click", closeHandler));
  });
}
