import h from "hyperscript";
import { $, $$ } from "./query";

// https://www.radix-ui.com/icons
const CHEVRON_LEFT = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;
const CHEVRON_RIGHT = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;

export type SlideySlide = number | "firstElementWidth" | "containerWidth";

export type SlideyButtonCount = number | "auto";

export type SlideyArgs = {
  container: HTMLElement;
  /**
   * How much to move slidey by
   * - number: amount in pixels
   * - "firstElementWidth": move by the width of the first slidey item
   * - "containerWidth": move by the entire slidey container's width
   *
   * Defaults to "firstElementWidth"
   *
   * Depending on your styles, firstElementWidth may be equal to the containerWidth (ie: a full sized slideshow)
   * In that case, I recommend picking the more semantically correct option, containerWidth
   */
  slide?: SlideySlide;
  /**
   * How many buttons to show
   * Will not show any buttons if equal to one (doesn't make sense to navigate with one button)
   * - number: number of buttons (not recommended)
   * - "auto": determine how many buttons are necessary depending on the SlideySlide configuration
   *
   * Defaults to "auto"
   */
  buttonCount?: SlideyButtonCount;
  /**
   * Spacing between items
   * Defaults to 16px
   */
  gutterWidth?: number;
};

export class Slidey {
  private container: HTMLElement;
  private oldContainerInnerHTML: string;
  private childNodes: Node[];

  private slide: SlideySlide;
  private buttonCount: SlideyButtonCount;
  private gutterWidth: number;

  currentIndex = 0;

  constructor(args: SlideyArgs) {
    this.container = args.container;
    this.oldContainerInnerHTML = this.container.innerHTML;
    this.childNodes = [...this.container.childNodes]
      .filter((node) => !(node instanceof Text))
      .map((node) => node.cloneNode(true));

    this.slide = args.slide || "firstElementWidth";
    this.buttonCount = args.buttonCount || "auto";
    this.gutterWidth = args.gutterWidth || 16;
    if (!args.gutterWidth) {
      console.warn(
        "[slidey] you should probably pass in a real gutter width, defaults to 16px"
      );
    }
  }

  /**
   * Empty out container & add slidey elements
   */
  private render() {
    this.container.innerHTML = "";
    this.container.appendChild(
      h(
        "div",
        {},
        h(
          "div",
          { "data-slidey-root": "" },
          h(
            "div",
            { "data-slidey-row": "" },
            ...this.childNodes.map((node) =>
              h("div", { "data-slidey-row-item": "" }, node)
            )
          ),
          h(
            "div",
            { "data-slidey-arrow-root": "left" },
            h("div", {
              "data-slidey-arrow": "left",
              innerHTML: CHEVRON_LEFT,
            })
          ),
          h(
            "div",
            { "data-slidey-arrow-root": "right" },
            h("div", {
              "data-slidey-arrow": "right",
              "data-slidey-active": "",
              innerHTML: CHEVRON_RIGHT,
            })
          )
        ),
        h(
          "div",
          { "data-slidey-nav": "" },
          h(
            "div",
            { "data-slidey-nav-content": "" },
            ...new Array(this.getButtonsCount()).fill(0).map((_, i) => {
              const button = h("button", { "data-slidey-nav-item": "" });
              button.setAttribute("data-slidey-nav-item", "");
              if (i === 0) {
                button.setAttribute("data-slidey-active", "");
              }
              return button;
            })
          )
        )
      )
    );
  }

  getButtonsCount() {
    let buttonsCount = 0;
    if (typeof this.buttonCount === "number") {
      buttonsCount = this.buttonCount;
    } else if (this.buttonCount === "auto") {
      const itemsCount = this.container.offsetWidth / this.getSlide();
      buttonsCount = Math.ceil(this.childNodes.length - itemsCount);
    } else {
      throw new Error(
        `[slidey] invalid button count configuration "${this.buttonCount}"`
      );
    }

    return buttonsCount;
  }

  getSlide() {
    let slide = 0;
    if (typeof this.slide === "number") {
      slide = this.slide;
    } else if (this.slide === "firstElementWidth") {
      slide =
        (this.childNodes.find((node) => node instanceof HTMLElement)
          ?.offsetWidth || 0) + this.gutterWidth;
    } else if (this.slide === "containerWidth") {
      slide = this.container.offsetWidth + this.gutterWidth;
    } else {
      throw new Error(`[slidey] invalid slide configuration "${this.slide}"`);
    }

    return slide;
  }

  mount() {
    this.render();

    const arrowLeft = $<HTMLDivElement>(
      this.container,
      "[data-slidey-arrow='left']"
    );
    const arrowRight = $<HTMLDivElement>(
      this.container,
      "[data-slidey-arrow='right']"
    );

    const buttons = $$<HTMLButtonElement>("[data-slidey-nav-item]");
    const row = $<HTMLDivElement>(this.container, "[data-slidey-row]");

    const deactivateButtons = () => {
      buttons.forEach((button) => {
        button.removeAttribute("data-slidey-active");
      });
    };

    const activateButton = (index: number) => {
      deactivateButtons();
      buttons[index].setAttribute("data-slidey-active", "");
      row.scrollLeft =
        index === buttons.length - 1
          ? row.scrollWidth
          : index * this.getSlide();
      this.currentIndex = index;

      // toggle arrows
      arrowRight.setAttribute("data-slidey-active", "");
      arrowLeft.setAttribute("data-slidey-active", "");
      if (index === 0) {
        arrowLeft.removeAttribute("data-slidey-active");
      }
      if (index === buttons.length - 1) {
        arrowRight.removeAttribute("data-slidey-active");
      }
    };

    arrowLeft.onclick = () => {
      activateButton(Math.max(this.currentIndex - 1, 0));
    };
    arrowRight.onclick = () => {
      activateButton(Math.min(this.currentIndex + 1, buttons.length - 1));
    };

    buttons.forEach((button, i) => {
      button.onclick = () => {
        activateButton(i);
      };
    });
  }

  unmount() {
    this.container.innerHTML = this.oldContainerInnerHTML;
  }
}
