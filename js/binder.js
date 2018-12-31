const highlightDuration = parseFloat(
  window
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

      el.customEvents = el.customEvents || {};
      el.customEvents.changeListener = changeListener;
      el.dataset.transitionTimeoutId = setTimeout(() => {
        el.classList.remove("just-changed");
        delete el.dataset.transitionTimeoutId;
      }, highlightDuration);
    });
};

const binder = {
  watchAndTransform: (callback, transformer, ...elements) => {
    const handler = e => {
      const changedElement = e.target;
      const newValue = changedElement.value;

      if (elements.includes(changedElement)) {
        // changes the bound elements so they match the changed one
        transformer();
        // calls some callback to do something
        callback();
        // higlights the changed elements
        highlightElements(elements, changedElement, handler);
      }
    };

    ["input", "change"].forEach(type =>
      document.addEventListener(type, handler)
    );
  },

  bind: (callback, ...elements) => {
    const handler = e => {
      const changedElement = e.target;

      if (elements.includes(changedElement)) {
        // changes the bound elements so they match the changed one
        elements
          .filter(el => el !== changedElement)
          .forEach(el => (el.value = changedElement.value));
        // calls some callback to do something
        callback();
        // higlights the changed elements
        highlightElements(elements, changedElement, handler);
      }
    };

    ["input", "change"].forEach(type =>
      document.addEventListener(type, handler)
    );
  },

  unbind: (...elements) => {
    elements.forEach(el => {
      if (typeof el.customEvents !== "object") {
        return;
      }

      const changeListener = el.customEvents.changeListener;
      delete el.customEvents.changeListener;
      if (changeListener && changeListener !== "undefined") {
        ["input", "change"].forEach(type =>
          document.removeEventListener(type, changeListener)
        );
      }
    });
  }
};

export default binder;
