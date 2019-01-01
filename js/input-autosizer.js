import delegate from "./delegator.js";

const RELATED_EVENTS = ["input", "change"];
const MAX_WIDTH = "6"; // em
const MIN_WIDTH = "2"; // em

const doResize = e => {
  const el = e.target;

  const desiredWidth = Math.max(MIN_WIDTH, Math.min(el.value.length, MAX_WIDTH));
  el.style.width = `${desiredWidth}em`;
};

const resizer = {
  bind: (el, targetSelector) => {
    let delegated = delegate(targetSelector, doResize);
    RELATED_EVENTS.forEach(type => el.addEventListener(type, delegated));
    el.customEvents = el.customEvents || {};
    el.customEvents.resizer = delegated;
  },

  unbind: el => {
    if (el.customEvents && el.customEvents.resizer) {
      const doResize = el.customEvents.resizer;
      delete el.customEvents.resizer;
      RELATED_EVENTS.forEach(type => el.removeEventListener(type, doResize));
    }
  }
};

export default resizer;
