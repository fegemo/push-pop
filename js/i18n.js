const availableLanguages = ["pt", "en"];
const pack = {
  "page-title": {
    pt: "Tutorial de Matrizes OpenGL",
    en: "OpenGL Matrices Tutorial"
  },
  "page-heading": {
    pt: "Tutorial de matrizes <strong>OpenGL</strong>",
    en: "<strong>OpenGL</strong> matrices tuorial"
  },
  "page-about": {
    pt: `Esta explicação interativa tem o intuito de mostrar o funcionamento
    das funções de matrizes do OpenGL (com pipeline fixo) e como funcionam as pilhas de matrizes,
    além da composição de transformações.`,
    en: `This interactive explanation aims to show the inner workings
    of the matrix functions in OpenGL (fixed function pipeline) and how the
    matrix stacks work, as well as transformation composition.`
  },
  "footer-description": {
    pt: `Esta foi uma iniciativa do aluno <a href="mailto:higorflopes@gmail.com">Higor Fischer</a>
    e do professor <a href="https://github.com/fegemo/">Flávio Coutinho</a>.`,
    en: `This was an initiative from the student <a href="mailto:higorflopes@gmail.com">Higor Fischer</a>
    and professor <a href="https://github.com/fegemo/">Flávio Coutinho</a>.`
  },
  "modal-title": {
    pt: "Descreva a matriz",
    en: "Describe the matrix"
  },
  "current-matrix": {
    pt: "Matriz atual",
    en: "Current matrix"
  },
  "generated-matrix": {
    pt: "Matriz gerada",
    en: "Generated matrix"
  },
  "resulting-matrix": {
    pt: "Matriz resultante",
    en: "Resulting matrix"
  },
  "modal-ok": {
    pt: "Ok",
    en: "Ok"
  },
  "not-yet-implemented": {
    pt: "Ainda não implementado",
    en: "Not yet implemented"
  },
  "explanation-push": {
    pt: `Clona a matriz que está no topo da pilha corrente e a empilha`,
    en: `Clones the matrix which is on top of the current stack and pushes it there`
  },
  "explanation-pop": {
    pt: `Remove a matriz que está no topo da pilha corrente, voltando com a matriz anterior`,
    en: `Discards the matrix at the top of the current stack, going back to the previous matrix`
  },
  "explanation-load": {
    pt: `Carrega o array de 16 <code>floats</code> passado como parâmetro na matriz que está no topo da pilha de matrizes corrente`,
    en: `Loads an array of 16 <code>floats</code> passed as parameter into the matrix which is on the top of the current matrix stack`
  },
  "explanation-mult": {
    pt: `Multiplica a matriz que está no topo da pilha de matrizes corrente por uma matriz formada pelo array de 16 <code>floats</code> passado como parâmetro`,
    en: `Multiplies the matrix which is on top of the current matrix stack with the matrix provided by the 16 <code>floats</code> array passed as argument`
  },
  "explanation-translate": {
    pt: `Gera uma matriz de translação e a multiplica à direita (<strong>pós multiplicação</strong>) da matriz que está no topo da pilha de matrizes corrente`,
    en: `Generates a translation matrix and multiplies it to the right (<strong>post-multiplication</code>) of the matrix which is on top of the current matrix stack`
  },
  "explanation-scale": {
    pt: `Gera uma matriz de escala e a multiplica à direita (<strong>pós multiplicação</strong>) da matriz que está no topo da pilha de matrizes corrente`,
    en: `Generates a scaling matrix and multiplies it to the right (<strong>post-multiplication</code>) of the matrix which is on top of the current matrix stack`
  },
  "explanation-rotation": {
    pt: `Gera uma matriz de rotação dada por um ângulo (em graus) e um eixo de rotação e a multiplica à direita (<strong>pós multiplicação</strong>) da matriz que está no topo da pilha de matrizes corrente`,
    en: `Generates a rotation matrix given by an angle (in degrees) and a rotation axis and multiplies it to the right (<strong>post-multiplication</code>) of the matrix which is on top of the current matrix stack`
  },
  current: {
    pt: "Atual",
    en: "Current"
  },
  "": {
    pt: "",
    en: ""
  },
  "explanation-more-info": {
    pt: "Mais informações:",
    en: "More info:"
  }
};

const translate = (key, language) => {
  const text = pack[key];
  if (text && text[language]) {
    return text[language];
  } else {
    return `@key@ missing`;
  }
};

const replaceTranslatables = (selector, language) => {
  const translatableEls = document.querySelectorAll(selector);

  translatableEls.forEach(el => {
    switch (el.tagName.toLowerCase()) {
      case "input":
        el.value = translate(el.dataset.t, language);
        break;
      case "img":
        el.src = translate(el.dataset.t, language);
        break;
      case "meta":
        el.content = translate(el.dataset.t, language);
        break;
      default:
        el.innerHTML = translate(el.dataset.t, language);
        break;
    }
  });
};

const getDefaultLanguage = () => {
  const languageFound = navigator.languages.find(
    l => availableLanguages.indexOf(l) !== -1
  );

  return languageFound || "pt";
};

let currentLanguage = getDefaultLanguage();

export const bootstrapi18n = (selector = "data-t") => {
  replaceTranslatables(selector, currentLanguage);
};

export const t = key => translate(key, currentLanguage);
