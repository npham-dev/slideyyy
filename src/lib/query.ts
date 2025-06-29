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

export { $, $$ };
