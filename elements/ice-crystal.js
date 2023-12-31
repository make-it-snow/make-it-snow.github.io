customElements.define('ice-crystal', class extends HTMLElement {
    constructor() {
        super()
            .attachShadow({ mode: "open" })
            .innerHTML = `<svg viewBox="0 0 140 140">` +
            `<g id=id fill=none stroke=white stroke-linecap=round` +
            ` transform="rotate(${Math.random() * 70} 70 70)">` +
            `<path d="M70 70v-60" opacity=${.4 + Math.random()} stroke-width=${7 + Math.floor(Math.random() * 7)} />` +
            `<path d="M45 28l25 18l28-16" opacity=${.4 + Math.random()} stroke-width=${7 + Math.floor(Math.random() * 7)} />` +
            `<path d="M50 11l20 20l20-20" opacity=${.4 + Math.random()} stroke-width=${7 + Math.floor(Math.random() * 7)} />` +
            `</g>` +
            `<use href=#id transform="rotate(72 70 70)"/>` +
            `<use href=#id transform="rotate(144 70 70)"/>` +
            `<use href=#id transform="rotate(216 70 70)"/>` +
            `<use href=#id transform="rotate(288 70 70)"/>` +
            `</svg>`
    }
});