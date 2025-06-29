import h from "hyperscript";
import { Slidey } from "./lib/slidey";
import { $ } from "./lib/query";

import "./styles.css";

for (let i = 0; i < 20; i++) {
  $(".slidey").appendChild(h("div.slidey__item", {}, i + 1));
}

const slidey = new Slidey({
  container: document.querySelector(".slidey")!,
  buttonCount: 0,
});
slidey.mount();
