// TODO: documentation

/* TODO: Target format
const {output, cancel} = stream(
  pipe(
    delay(1000),
    map(async i => i * 2),
  ),
  timeout(10000),
  retry(3),
);

retry(...),
filter(...),
map(...),   <-⌍ 
until(...), <-- generalising delayedWhile
delay(...), <-⌏
timeout(...),

*/

export const cancellationToken = Symbol('cancellationToken');
export const iterationCancellationToken = Symbol('iterationCancellationToken');
export const timeoutToken = Symbol('timeoutToken');

export const to = async (promise) => {
  return Promise.resolve(promise)
    .then((output) => [null, output])
    .catch((error) => [error, null]);
};

export const and = (...fns) => async (...args) => {
  const results = await Promise.all(fns.map(async fn =>
    await Promise.resolve(fn(...args))
  ));

  return results.every(Boolean);
};
export const or = (...fns) => async (...args) => {
  const results = await Promise.all(fns.map(async fn =>
    await Promise.resolve(fn(...args))
  ));

  return results.some(Boolean);
};
export const not = (fn) => (...args) => !fn(...args);

export const map = (fn) => async (...args) => await fn(...args);
export const retry = (retries = 3) => async (promise) => {
  const [error, result] = await to(promise);
  if (!error) {
    return result;
  }

  const currentRetries = retries - 1;
  if (currentRetries <= 0) {
    throw new Error('Maximum number of retries exceeded');
  }

  return retry(fn, currentRetries)(...args);
};
export const filter = (predicate) => async (...args) => {
  const condition = await predicate(...args);
  if (condition) {
    throw iterationCancellationToken;
  }

  return args;
};
export const until = (predicate) => async (...args) => {
  const condition = await predicate(...args);
  if (condition) {
    throw cancellationToken;
  }

  return args;
};
export const delay = (ms = 1000) => (...args) => new Promise(
  resolve => setTimeout(() => resolve(...args), ms)
);
export const timeout = (ms = 10000) => async (promise) => {
  const timeoutInterval = setTimeout(() => {
    throw timeoutToken;
  }, ms);

  const result = await promise;

  clearTimeout(timeoutInterval);
  return result;
};

export const compose = (...fns) => fns.reduce((acc, val) =>
  async (...args) => val(await acc(...args)),
);

export const processPipeline = async (pipeline, items) => {
  const results = [];
  for (const item of items) {
    const [error, result] = await to(pipeline(item));

    if (error) {
      switch (error) {
        case iterationCancellationToken:
          continue;

        case cancellationToken:
          return results;

        default:
          console.log(error);
          throw error;
      }
    }

    results.push(result);
  }

  return results;
};
export const pipe = (...ops) => async (items) => {
  const pipeline = compose(...ops);
  return processPipeline(pipeline, items);
};

export const stream = (pipe, ...ops) => async (items) => {
  const streamline = compose(...ops);
  const [error, results] = await to(streamline(pipe(items)));

  if (error) {
    // TODO
  }

  return results;
};



