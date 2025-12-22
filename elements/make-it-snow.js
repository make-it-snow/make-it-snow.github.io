//console.clear();
const name = (new URL(import.meta.url).searchParams.get("flake")) || "snow-flake";
const flake = () => document.createElement(name);
const flakes = length => Array.from({ length }, flake);
customElements.define('make-it-snow', class extends HTMLElement {
    connectedCallback() {
        this.snow(this.flakecount);
    }
    get flakecount() {
        return ~~(this.getAttribute("flakecount") || 50)
    }
    snow(count = 1) {
        console.log("%c adding %i snowflakes ", "background:beige", count);
        this.prepend(...flakes(count));
    }
    disconnectedCallback() {
        console.log("disconnected", this.nodeName);
    }
});