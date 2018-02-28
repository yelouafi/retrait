import test from "tape";
import { combineModels, prop } from "../src";

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

function createCtx(state) {
  const ctx = {
    state,
    setState(s) {
      if (typeof s === "function") {
        s = s(ctx.state);
      }
      ctx.state = deepFreeze(Object.assign({}, ctx.state, s), "state");
    }
  };
  return ctx;
}

const counterModel = ctx => ({
  init() {
    return { count: 0, dummy: "dummy" };
  },
  restore(savedState) {
    return savedState;
  },
  increment() {
    ctx.setState(state => ({ count: state.count + 1 }));
  }
});

test("prop proxy", assert => {
  const ctx = createCtx({
    prop: 1,
    deep: {
      prop: 2,
      dummy: "dummy"
    }
  });

  const deepCtx = prop("deep", ctx);
  assert.equal(deepCtx.state, ctx.state.deep);
  deepCtx.setState({ prop: 3 });
  assert.deepEqual(ctx.state, {
    prop: 1,
    deep: {
      prop: 3,
      dummy: "dummy"
    }
  });
  assert.equal(deepCtx.state, ctx.state.deep);
  assert.end();
});

test("combineModels", assert => {
  const ctx = createCtx(null);

  const model = combineModels({
    counter1: counterModel,
    child: combineModels({
      counter1: counterModel,
      counter2: counterModel
    })
  })(ctx);

  const state0 = (ctx.state = deepFreeze(model.init(), "state"));
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

  ctx.state = model.restore(state0);
  assert.deepEqual(ctx.state, state0);
  assert.end();
});
