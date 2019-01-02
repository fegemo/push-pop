const INTERACTION_EVENTS = ["mousedown", "touchstart"];
let didInteract = false;


const interacted = () => {
  didInteract = true;
  ["mousedown", "touchstart"].forEach(type => document.body.removeEventListener(type, interacted));
};

["mousedown", "touchstart"].forEach(type => document.body.addEventListener(type, interacted));


export default function hasUserInteractedWithPage() {
  return didInteract;
};
