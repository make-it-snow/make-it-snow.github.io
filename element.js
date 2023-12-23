{
    //{ } created scoped block
    console.clear();
    const element = (tag, props = {}) => Object.assign(document.createElement(tag), props);
    const random = (min, max) => min + Math.floor(Math.random() * (max - min) + 1);
    const flakecount = 1;
    const snowFlake = () => element("snow-flake");
    const addSnow = (flakes = snowFlake()) => document.body.append(...snowFlakes);
    const randomOffset = (offset) => random(-offset, offset);
    const random10 = () => randomOffset(2);
    const stepsarray = (min, max, length = 10) => Array.from({
        length
    }, (_, index) =>
        min + (max - min) * index / (length - 1)
    );
    let snowFlakes = Array.from({
        length: flakecount
    }, snowFlake);
    addSnow(snowFlakes);
    customElements.define('snow-flake', class extends HTMLElement {
        constructor() {
            const keyframecount = 5;
            const bottom = 20;
            const stepsY = stepsarray(5, bottom, keyframecount).map(x => x);
            const swingX = stepsarray(-2, 2, keyframecount).map(random10);
            const rotate = stepsarray(0, 360, keyframecount);
            if (random(1, 3) == 2) rotate.reverse();
            const x = random(10, 90);
            console.log(x, stepsY, swingX);
            const transform = (i, o = 1) => `translate(${x + swingX[i]}vw, ${stepsY[i]}vh) rotate(${rotate[i]}deg); opacity:${o}`;
            super()
                .attachShadow({
                    mode: 'open'
                })
                .innerHTML = `
<style>
	@keyframes animation {
    0%  { transform: ${transform(0, 1)} }
    25% { transform: ${transform(1, .75)} }
    50% { transform: ${transform(2, .5)} }
    75% { transform: ${transform(3, .25)} }
    100% { transform: ${transform(4, 1)} }
  }
  svg {
  	transform: scale(2);
    left:${x}vw;
    top:10px;
    position: fixed;
    transform-origin:center;
    background:pink;
  }  
</style><ice-crystal></ice-crystal>`;
        }
        drop(speed = random(4, 10),) {
            const delay = 0;//random(0, 0) / 1;
            this.shadowRoot.append(
                element("STYLE", {
                    innerHTML: `svg{animation:animation ${speed}s linear ${delay}s forwards}`
                })
            );
        }
        connectedCallback() {
            let svg = this.shadowRoot.querySelector("svg");
            svg.style.width = "20px";
            Object.assign(svg, {
                onanimationiteration: (evt) => {
                    console.warn(evt.type, this.nodeName)
                },
                onanimationend: (evt) => {
                    this.onthefloor(evt);
                }
            });
            this.drop();
        }
        onthefloor(evt) {
            console.warn(evt.type, this.nodeName);
            addSnow();
            this.remove();
        }
        disconnectedCallback() {
            console.log("disconnected");
        }
    });
}