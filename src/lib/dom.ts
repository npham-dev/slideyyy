function $<T extends Element = Element>(selector: string): T;
function $<T extends Element = Element>(parent: Element, selector: string): T;
function $<T extends Element = Element>(
  arg1: string | Element,
  arg2?: string
): T {
  let parent: Element;
  let selector: string;

  if (typeof arg1 === "string") {
    parent = document.body;
    selector = arg1;
  } else {
    parent = arg1;
    selector = arg2!;
  }

  return parent.querySelector(selector) as T;
}

function $$<T extends Element = Element>(selector: string): T[];
function $$<T extends Element = Element>(
  parent: Element,
  selector: string
): T[];
function $$<T extends Element = Element>(
  arg1: string | Element,
  arg2?: string
): T[] {
  let parent: Element;
  let selector: string;

  if (typeof arg1 === "string") {
    parent = document.body;
    selector = arg1;
  } else {
    parent = arg1;
    selector = arg2!;
  }

  return Array.from(parent.querySelectorAll(selector)) as T[];
}

function h(
  tag: keyof HTMLElementTagNameMap,
  props: Record<string, any> = {},
  ...children: (Node | number | string | undefined)[]
) {
  const el = document.createElement(tag);

  for (const k in props) {
    if (k.startsWith("on")) {
      el.addEventListener(k.slice(2).toLowerCase(), props[k]);
    } else if (k === "innerHTML") {
      el[k] = props[k];
    } else {
      el.setAttribute(k, props[k]);
    }
  }

  for (const child of children.flat(Infinity).filter((child) => !!child)) {
    el.appendChild(
      child instanceof Node ? child : document.createTextNode(String(child))
    );
  }

  return el;
}

export { $, $$, h };
