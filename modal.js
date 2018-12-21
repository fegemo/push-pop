function openMatrixModal(operation, currentMatrix) {
  const modalMatrixEl = document.querySelector('#modal-matrix');
  const currentMatrixEl = modalMatrixEl.querySelector('#mat-left');
  const generatedMatrixEl = modalMatrixEl.querySelector('#mat-top');
  const resultingMatrixEl = modalMatrixEl.querySelector('#mat-right');
  modalMatrixEl.style.display = 'block';
  setTimeout(() => {
    modalMatrixEl.classList.add('in');
  }, 10);

  const params = operation.getParams();
  currentMatrixEl.classList.toggle('invisible', !params.showLeftMatrix);
  modalMatrixEl.querySelector('#current-matrix').classList.toggle('invisible', !params.showMiddleMatrix);
  generatedMatrixEl.classList.toggle('invisible', !params.showMiddleMatrix);
  modalMatrixEl.querySelector('#generated-matrix').classList.toggle('invisible', !params.showLeftMatrix);
  modalMatrixEl.querySelector('#operation-params').classList.toggle('invisible', !params.showLeftMatrix);
  resultingMatrixEl.classList.toggle('invisible', !params.showRightMatrix);
  modalMatrixEl.querySelector('#resulting-matrix').classList.toggle('invisible', !params.showRightMatrix);

  modalMatrixEl.querySelector('#matrices').classList.toggle('single-matrix', !params.showLeftMatrix && params.showMiddleMatrix && !params.showRightMatrix);

  const paramsEl = modalMatrixEl.querySelector('#operation-params');
  paramsEl.innerHTML = `<pre><code>${params.openGLCommands.map(c => input(c)).join('\n')}</code></pre>`;
  params.params.forEach((p, i) => {
    if (p) {
      generatedMatrixEl.querySelector(`.matrix-value:nth-of-type(${i+1})`).removeAttribute('disabled');
    }
  });

  function input(line) {
    return line.replace(/@input/g, '<input type="number" class="parameter float-parameter">')
  }

  function getValue(id) {
    return parseFloat(modalMatrixEl.querySelector(id).value);
  }

  return new Promise((resolve, reject) => {
    const matrix = currentMatrix;

    let modalOkEl = modalMatrixEl.querySelector('#matrix-ok');
    modalOkEl.addEventListener('click', () => {
      alert('Vai dar pau pq tirei os ids das matrizes');
      matrix[0] = getValue('#r1c1');
      matrix[1] = getValue('#r1c2');
      matrix[2] = getValue('#r1c3');
      matrix[3] = getValue('#r1c4');

      matrix[4] = getValue('#r2c1');
      matrix[5] = getValue('#r2c2');
      matrix[6] = getValue('#r2c3');
      matrix[7] = getValue('#r2c4');

      matrix[8] = getValue('#r3c1');
      matrix[9] = getValue('#r3c2');
      matrix[10] = getValue('#r3c3');
      matrix[11] = getValue('#r3c4');

      matrix[12] = getValue('#r4c1');
      matrix[13] = getValue('#r4c2');
      matrix[14] = getValue('#r4c3');
      matrix[15] = getValue('#r4c4');
      resolve(matrix);
      modalMatrixEl.classList.remove('in');
      setTimeout(() => {
        modalMatrixEl.style.display = 'none';
      }, 500);
    });

    let modalClose = modalMatrixEl.querySelectorAll('.close').forEach(el => {
      el.addEventListener('click', () => {
        modalMatrixEl.classList.remove('in');
        setTimeout(() => {
          modalMatrixEl.style.display = 'none';
        }, 500);
        reject();
      })
    })
  });
}
