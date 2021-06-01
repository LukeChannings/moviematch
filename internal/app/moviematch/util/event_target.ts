// EventTarget is built-in, but isn't type safe.
// This is a simple wrapper around EventTarget that adds type safety.
export class MMEventTarget<T extends string, E extends MessageEvent>
  extends EventTarget {
  constructor() {
    super();
  }

  addListener(
    type: T,
    listener: ((evt: E) => void | Promise<void>) | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    return EventTarget.prototype.addEventListener.call(
      this,
      type,
      listener as (evt: Event) => void,
      options,
    );
  } /** Dispatches a synthetic event event to target and returns true if either
   * event's cancelable attribute value is false or its preventDefault() method
   * was not invoked, and false otherwise. */

  dispatchEvent(event: E): boolean {
    return EventTarget.prototype.dispatchEvent.call(this, event);
  }
  /** Removes the event listener in target's event listener list with the same
   * type, callback, and options. */
  removeListener(
    type: T,
    callback: ((evt: E) => void | Promise<void>) | null,
    options?: EventListenerOptions | boolean,
  ): void {
    return EventTarget.prototype.removeEventListener.call(
      this,
      type,
      callback as (evt: Event) => void,
      options,
    );
  }
}
