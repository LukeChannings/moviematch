import { assertEquals } from "/deps.ts";
import { parseXML } from "./util.ts";

Deno.test("parseXML - with children", () => {
  assertEquals(
    parseXML(
      `<a attr1="foo" attr2="bar">
  <b attr1="foo" attr2="bar" />
  <b attr1="baz" attr2="abc" />
</a>`,
    ),
    {
      a: {
        attr1: "foo",
        attr2: "bar",
        b: [{ attr1: "foo", attr2: "bar" }, { attr1: "baz", attr2: "abc" }],
      },
    },
  );
});

Deno.test("parseXML - with reviver", () => {
  assertEquals(
    parseXML(`<a bool="1" id="12456" something="foo" />`, (_, key, value) => {
      if (key === "id") return Number(value);
      if (value === "0" || value === "1") return value === "1";
      return value;
    }),
    {
      a: {
        bool: true,
        id: 12456,
        something: "foo",
      },
    },
  );
});
