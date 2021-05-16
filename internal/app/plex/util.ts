import { XMLPullParser } from "/deps.ts";
import { Filter } from "/types/moviematch.ts";

export const filterToQueryString = (
  { key, value, operator }: Filter,
): [key: string, value: string] => {
  return [key + operator.slice(0, -1), value.join(",")];
};

export type XMLNode = { [key: string]: unknown };

export type XMLValueReviverFn = (
  elementName: string,
  key: string,
  value: string,
) => unknown;

export const parseXML = (
  xmlText: string,
  reviver?: XMLValueReviverFn,
): XMLNode => {
  const stack: XMLNode[] = [{}];

  const parser = new XMLPullParser();
  const events = parser.parse(xmlText);

  for (const event of events) {
    if (event.name === "start_element" && event.element) {
      const cursor: XMLNode = {};

      for (const attribute of event.element.attributes) {
        cursor[attribute.qName] = reviver
          ? reviver(event.element.qName, attribute.qName, attribute.value)
          : attribute.value;
      }

      stack[0][event.element.qName] = !event.element.parent ? cursor : [
        ...(stack[0][event.element.qName] ??
          []) as unknown as XMLNode[],
        cursor,
      ];

      stack.unshift(cursor);
    } else if (event.name === "end_element") {
      stack.shift();
    }
  }

  return stack[0];
};
