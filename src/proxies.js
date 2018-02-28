class ContextProxy {
  constructor(getter, setter, parent) {
    this.getter = getter;
    this.setter = setter;
    this.parent = parent;
  }

  get state() {
    return this.getter(this.parent.state);
  }

  setState(updater) {
    const { parent, getter, setter } = this;
    if (typeof updater === "function") {
      parent.setState(parentState => {
        const state = getter(parentState);
        const newState = Object.assign({}, state, updater(state));
        return setter(parentState, newState);
      });
    } else if (updater != null) {
      this.setState(_ => updater);
    }
  }
}

export function proxy(getter, setter, parent) {
  return new ContextProxy(getter, setter, parent);
}

function getProp(key) {
  return state => state[key];
}

function setProp(key) {
  return (state, value) => Object.assign({}, state, { [key]: value });
}

export function prop(key, parent) {
  return new ContextProxy(getProp(key), setProp(key), parent);
}
