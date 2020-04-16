export const timeout = (ms, promise, onTimeout) =>
  Promise.race(
    new Promise((resolve, reject) =>
      setTimeout(() => {
        reject(onTimeout)
      }, ms)
    ),
    promise
  )
