import { assert } from "util/assert.ts";

export function isRecord(
  value: unknown,
  name = "value",
): asserts value is Record<string, unknown> {
  assert(
    typeof value === "object" && value !== null,
    `${name} must be an object`,
  );
}
