import { prop } from "./proxies";

export function combineModels(models) {
  return function combinedModel(ctx) {
    const result = mapObject(models, (model, key) => {
      return model(prop(key, ctx));
    });

    result.init = function init(...args) {
      return mapObject(models, (model, key) => {
        return result[key].init(...args);
      });
    };

    result.restore = function restore(savedState) {
      return mapObject(models, (model, key) => {
        return result[key].restore(savedState[key]);
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
