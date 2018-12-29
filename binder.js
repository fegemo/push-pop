(function(global) {
  const highlightDuration = parseFloat(
    global
      .getComputedStyle(document.body)
      .getPropertyValue("--highlight-duration") || "0"
  );

  const highlightElements = (elements, changedElement, changeListener) => {
    const newValue = changedElement.value;

    elements
      .filter(el => el !== changedElement)
      .forEach(el => {
        if (el.value === newValue) {
          return;
        }

        if (el.dataset.transitionTimeoutId) {
          clearTimeout(el.dataset.transitionTimeoutId);
        }
        el.classList.add("just-changed");

        el.dataset.changeListener = changeListener;
        el.dataset.transitionTimeoutId = setTimeout(() => {
          el.classList.remove("just-changed");
          delete el.dataset.transitionTimeoutId;
        }, highlightDuration);
      });
  };

  global.binder = {
    watchAndTransform: (callback, transformer, ...elements) => {
      const changeListener = document.addEventListener("input", e => {
        const changedElement = e.target;
        const newValue = changedElement.value;

        if (elements.includes(changedElement)) {
          transformer();
          callback();
          highlightElements(elements, changedElement, changeListener);
        }
      });
    },

    bind: (callback, ...elements) => {
      const changeListener = document.addEventListener("input", e => {
        const changedElement = e.target;

        if (elements.includes(changedElement)) {
          callback();
          highlightElements(elements, changedElement, changeListener);
          elements
            .filter(el => el !== changedElement)
            .forEach(el => (el.value = changedElement.value));
        }
      });
    },

    unbind: (...elements) => {
      elements.forEach(el => {
        const changeListener = el.dataset.changeListener;
        delete el.dataset.changeListener;
        if (changeListener && changeListener !== "undefined") {
          document.removeEventListener("input", changeListener);
        }
      });
    }
  };
})(window);
