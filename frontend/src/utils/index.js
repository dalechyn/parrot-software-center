export const withTimeout = (timeoutMs, promise) => {
  return Promise.race([
    promise,
    new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error('Timed out')), timeoutMs)
    )
  ])
}

export const withCancel = pr => {
  let cancelled = false
  const cancellable = pr.then(val => {
    if (cancelled) return Promise.reject(new Error('Cancelled!'))
    return val
  })

  return [
    cancellable,
    () => {
      cancelled = true
    }
  ]
}
