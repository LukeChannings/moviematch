export const waitForEvent = (ee, eventName) =>
  new Promise(resolve => {
    ee.addEventListener(eventName, e => resolve(e))
  })
