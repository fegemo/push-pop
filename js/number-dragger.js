import delegate from "./delegator.js";

const draggedInput = {
  el: null,
  x: null,
  y: null,
  startValue: null
};

const mousePosition = {
  x: null,
  y: null
};

const mouseMoved = e => {
  if (draggedInput.el) {
    // sets the global mouse position
    mousePosition.x = e.clientX;
    mousePosition.y = e.clientY;

    // if browser allows it, try to find x/y relative to canvas rather than page
    if (e.offsetX != undefined) {
      mousePosition.x = e.offsetX;
      mousePosition.y = e.offsetY;
    } else if (e.layerX != undefined && e.originalTarget != undefined) {
      mousePosition.x = e.layerX - e.originalTarget.offsetLeft;
      mousePosition.y = e.layerY - e.originalTarget.offsetTop;
    }

    // incrementing/decrementing the input value
    draggedInput.el.blur();
    let deltaX = e.clientX - draggedInput.x;
    // TODO: fixed step
    deltaX = Math.round(deltaX / 10) * 0.1; // 0.1 for every 10px
    const val = draggedInput.startValue + deltaX;
    draggedInput.el.value = (Math.round(val * 10) / 10).toFixed(1);

    // dispatches a change event
    const changeEvent = new Event("change", { bubbles: true });
    draggedInput.el.dispatchEvent(changeEvent);
  }
};

const mouseUp = e => {
  draggedInput.el = null;
};

const startDragging = e => {
  draggedInput.el = e.target;
  draggedInput.x = e.clientX;
  draggedInput.y = e.clientY;
  draggedInput.startValue = parseFloat(e.target.value);
};

let delegated = null;

const dragger = {
  bind: (el, targetSelector, step) => {
    // TODO: step is currently not used... it's fixed inside mouseMoved
    let delegated = delegate(targetSelector, startDragging);
    el.addEventListener("mousedown", delegated);
    window.addEventListener("mousemove", mouseMoved);
    window.addEventListener("mouseup", mouseUp);
  },

  unbind: el => {
    if (delegated) {
      el.removeEventListener("mousedown", delegated);
    }
    window.removeEventListener("mousemove", mouseMoved);
    window.removeEventListener("mouseup", mouseUp);
  }
};

export default dragger;
