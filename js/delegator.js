const delegate = (targetSelector, callback) => {
  return e => {
    const delegatorEl = e.currentTarget;
    const validTargetTriggered = e.target.matches(targetSelector);
    if (validTargetTriggered) {
      callback(e);
    }
  };
};


export default delegate;
