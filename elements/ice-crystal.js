const URLparam = (name, defaultvalue) => (new URL(import.meta.url).searchParams.get(name)) || defaultvalue;
customElements.define(
    URLparam("name", "ice-crystal"),
    class extends HTMLElement {
        constructor() {
            super().attachShadow({ mode: "open" });
        }
        get color() {
            return this.getAttribute("color") || "#fff";
        }
        set color(value) {
            this.setAttribute("color", value);
        }
        get x() {
            return this.getAttribute("x") || Math.random() * 100;
        }
        set x(value) {
            this.setAttribute("x", value);
        }
        get y() {
            return this.getAttribute("y") || 0;
        }
        set y(value) {
            this.setAttribute("y", value);
        }
        connectedCallback() {
            this.render();
        }
        render() {
            console.log("%c new <ice-crystal> ", "background:beige", this.x, this.y, this.color, this.drift, this.parentNode.nodeName);
            this.shadowRoot.innerHTML =
                `<style>` +
                `:host{` +
                `--size:var(--flakesize,10%);` +
                `width:var(--size);display:inline-block;position:absolute` +
                `}` +
                `svg{width:100%;vertical-align:top` +
                `;zoom:${.5 + Math.random() * .5}` +
                `}` +
                `</style>` +
                `<style id=animation></style>` +
                `<style id=style></style>` +
                `<svg part=crystal viewBox="0 0 140 140">` +
                `<g id=id transform="rotate(${Math.random() * 70} 70 70)" fill=none stroke-linecap=round >` +
                `<path opacity=${.4 + Math.random()} stroke-width=${7 + Math.random() * 8} d="M70 70v-60"/>` +
                `<path opacity=${.4 + Math.random()} stroke-width=${7 + Math.random() * 8} d="M45 28l25 18l28-16"/>` +
                `<path opacity=${.4 + Math.random()} stroke-width=${7 + Math.random() * 8} d="M50 11l20 20l20-20"/>` +
                `</g>` +
                `<use href=#id transform="rotate(60 70 70)"/>` +
                `<use href=#id transform="rotate(120 70 70)"/>` +
                `<use href=#id transform="rotate(180 70 70)"/>` +
                `<use href=#id transform="rotate(240 70 70)"/>` +
                `<use href=#id transform="rotate(300 70 70)"/>` +
                `</svg>`;
            this.svg = this.shadowRoot.querySelector("svg");
            this.position();
            if (this.hasAttribute("animate")) this.animate({});
            this.onanimationend = this.fallen;
        }
        fallen() {
            console.log("fallen", this.nodeName, this.x, this.y, this.color, this.repeat);
            if (this.repeat) {
                //let cystal = this.parentNode?.appendChild(document.createElement("ice-crystal"));
                this.stop();
                this.position(this.x, 20, this.color);
                this.animate({});
            }
            //this.remove();
        }
        disconnectedCallback() {
            console.log("disconnected", this.nodeName, this.x, this.y, this.color);
        }
        position(
            x = this.x,
            y = this.y,
            color = this.color
        ) {
            this.x = x;
            this.y = y;
            console.error("position", this.x, this.y, this.color);
            this.shadowRoot.querySelector("#style").innerHTML = `#id{stroke:${color}}` +
                `:host{` +
                `left:calc(${x}% - calc(var(--size) / 2));` +
                `top:calc(${y}% - calc(var(--size) / 2))` +
                `}`;
        }
        get repeat() {
            return ~~(this.getAttribute("repeat") || URLparam("repeat", 1));
        }
        get drift() {
            return ~~(this.getAttribute("drift") || URLparam("drift", (Math.random() - 1) * 50));
        }
        get speed() {
            return ~~(this.getAttribute("speed") || URLparam("speed", 4 + (Math.random() - 1) * 2));
        }
        get rotate() {
            return ~~(this.getAttribute("rotate") || URLparam("rotate", 360));
        }
        stop() {
            this.shadowRoot.querySelector("#animation").innerHTML = "";
        }
        animate({
            speed = this.speed,
            drift = this.drift,
            rotate = -this.rotate,
            x = this.x,
            y = this.y,
            offset = 0,
            left = ~~x,
            top = `calc(${100}% + 1 * var(--size))`
        }) {
            drift += offset;
            //let percentages = [0, 10, 15, 20, 25, 30];
            let percentages = [0, 1, 2, 3, 4, 5];
            let leftpos = () => (left - (percentages.shift() + ~~(Math.random() * drift)) + "%");
            this.position(x);
            this.shadowRoot.querySelector("#animation").innerHTML = `@keyframes frames{` +
                `0%{left:${leftpos(0)}%;top:calc(-2 * var(--size));rotate:0deg}` +
                `20%{left:${leftpos(1)}}` +
                `40%{left:${leftpos(2)}}` +
                `60%{left:${leftpos(3)}}` +
                `80%{left:${leftpos(4)}}` +
                `100%{left:${leftpos(5)};top:${top};transform:` +
                `translateY(-100%);rotate:${rotate}deg}` +
                `}` +
                `:host{animation:frames ${speed}s linear 0s forwards}`;
        }
    }
);