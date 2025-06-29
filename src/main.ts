import { Slidey } from "./lib/slidey";
import { $, h } from "./lib/dom";

import "./styles.css";

for (let i = 0; i < 20; i++) {
  $(".slidey").appendChild(h("div", { class: "slidey__item" }, i + 1));
}

const slidey = new Slidey({
  container: document.querySelector(".slidey")!,
  slide: "containerWidth",
  // buttonCount: 0,
});
slidey.mount();
