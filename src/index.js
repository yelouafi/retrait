class ContextProxy {
  constructor(key, parent) {
    this.key = key;
    this.parent = parent;
  }

  get state() {
    return this.parent.state[this.key];
  }

  setState(updater) {
    const { parent, key } = this;
    if (typeof updater === "function") {
      parent.setState(state =>
        Object.assign({}, state, {
          [key]: Object.assign({}, state[key], updater(state[key]))
        })
      );
    } else if (updater != null) {
      this.setState(_ => updater);
    }
  }
}

export function combineModels(models) {
  return function combinedModel(ctx) {
    const result = mapObject(models, (model, key) => {
      return model(new ContextProxy(key, ctx));
    });

    result.getInitialState = function getInitialState(...args) {
      return mapObject(models, (model, key) => {
        return result[key].getInitialState(...args);
      });
    };

    return result;
  };
}

function mapObject(obj, fn) {
  const result = {};

  Object.keys(obj).forEach(key => {
    result[key] = fn(obj[key], key, obj);
  });
  return result;
}
