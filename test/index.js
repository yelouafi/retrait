import test from "tape";
import { combineModels } from "../src";

function isPrimitive(v) {
  const type = typeof v;
  return (
    v == null || type === "string" || type === "number" || type === "boolean"
  );
}

function deepFreeze(obj, path = "") {
  const res = {};
  Object.keys(obj).forEach(key => {
    let value = obj[key];
    if (!isPrimitive(value)) {
      value = deepFreeze(value, path + "." + key);
    }
    Object.defineProperty(res, key, {
      enumerable: true,
      get() {
        return value;
      },
      set() {
        throw new Error(`Trying to mutate property '${path}.${key}'`);
      }
    });
  });
  return res;
}

test("combineModels", assert => {
  const ctx = {
    state: null,
    setState(s) {
      if (typeof s === "function") {
        s = s(ctx.state);
      }
      ctx.state = deepFreeze(Object.assign({}, ctx.state, s), "state");
    }
  };

  const counterModel = ctx => ({
    getInitialState() {
      return { count: 0, dummy: "dummy" };
    },
    increment() {
      ctx.setState(state => ({ count: state.count + 1 }));
    }
  });

  const model = combineModels({
    counter1: counterModel,
    child: combineModels({
      counter1: counterModel,
      counter2: counterModel
    })
  })(ctx);
  ctx.state = deepFreeze(model.getInitialState(), "state");
  assert.deepEqual(
    ctx.state,
    {
      counter1: { count: 0, dummy: "dummy" },
      child: {
        counter1: { count: 0, dummy: "dummy" },
        counter2: { count: 0, dummy: "dummy" }
      }
    },
    "should combine initial states of child counters"
  );

  model.counter1.increment();
  assert.deepEqual(
    ctx.state,
    {
      counter1: { count: 1, dummy: "dummy" },
      child: {
        counter1: { count: 0, dummy: "dummy" },
        counter2: { count: 0, dummy: "dummy" }
      }
    },
    "should increment the count of counter1"
  );

  model.child.counter1.increment();
  model.child.counter2.increment();
  assert.deepEqual(
    ctx.state,
    {
      counter1: { count: 1, dummy: "dummy" },
      child: {
        counter1: { count: 1, dummy: "dummy" },
        counter2: { count: 1, dummy: "dummy" }
      }
    },
    "should increment the count of counter1"
  );
  assert.end();
});
