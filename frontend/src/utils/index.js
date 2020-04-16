export const withTimeout = (timeoutMs, promise) => {
  return Promise.race([
    promise,
    new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timed out')), timeoutMs))
  ])
}
