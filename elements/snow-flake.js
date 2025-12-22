customElements.whenDefined('ice-crystal').then(() => {
    let element = (tag, props = {}) => Object.assign(document.createElement(tag), props);
    let random = (min, max = min) => min + Math.floor(Math.random() * (max - min + 1));
    let offset = (offset) => random(-offset, offset);
    let stepsarray = (min, max, length = 10, _offset = 0) => Array.from({
        length
    }, (_, index) =>
        min + (max - min) * index / (length - 1) + offset(_offset)
    );
    function percentArray(n, minStep = 15, maxStep = 20) {
        // fill array with n values betwen 0% and 100% (inclusive)
        if (n < 2) return [0]; // If less than 2 values are requested, return only the starting point
        let values = [0];
        let remaining = 100;
        // Generate n-2 random values (excluding the starting 0 and ending 100)
        for (let i = 0; i < n - 2; i++) {
            let maxPossibleStep = Math.min(remaining - (n - 2 - i) * minStep, maxStep);
            if (maxPossibleStep < minStep) break; // Break if remaining range is too small
            let step = Math.floor(Math.random() * (maxPossibleStep - minStep + 1)) + minStep;
            remaining -= step;
            values.push(values[values.length - 1] + step);
        }
        values.push(100); // Ensure that the last value is always 100
        return values;
    }

    customElements.define('snow-flake', class extends customElements.get('ice-crystal') {
        drop(speed = random(1),) {
            speed = 2;
            let delay = 0;//random(0, 0) / 1;
            this.shadowRoot.append(
                element("STYLE", {
                    innerHTML: `:host{animation:animation ${speed}s linear ${delay}s forwards}`
                })
            );
        }
        connectedCallback() {
            super.connectedCallback();
            let keyframecount = 5;
            let bottom = ~~(this.style.getPropertyValue("--bottom") || 100);
            let stepsY = stepsarray(0, bottom, keyframecount).map(x => ~~x);
            let swingX = stepsarray(-5, 5, keyframecount).map(() => offset(2));
            let scaleArr = stepsarray(10, 10, keyframecount).map(x => x / 10);
            //let rotate = stepsarray(0, 360, keyframecount);
            let rotateArr = percentArray(keyframecount);
            if (random(1, 3) == 2) rotateArr.reverse();
            let xPosition = random(0, 100);
            //x = 0;
            this.keyframes = percentArray(keyframecount)
                .map((percent, i) => {
                    let translateX = xPosition + swingX[i];
                    translateX = -100;
                    let translateY = stepsY[i];
                    //translateY = 50;
                    let translate = `translate(${translateX}% , ${translateY}%)`;
                    let rotate = `rotate(${rotateArr[i]}deg)`;
                    rotate = ``;
                    let scale = `scale(${scaleArr[i]})`;
                    scale = ``;
                    //translate = ``;
                    let str = `${percent}% { transform:${translate} ${rotate} ${scale}; opacity:${1} }`;
                    //console.log(str);
                    return str;
                })
                .join("\n");
            console.log(bottom, stepsY, this.parentNode.clientWidth, this.parentNode.clientHeight, this.clientWidth);
            this.shadowRoot
                .append(
                    element("STYLE", {
                        innerHTML:
                            `@keyframes animation {${this.keyframes}}` +
                            // `:host{left:0%;top:10%}`+
                            ``
                    })
                );
            let svg = this.shadowRoot.querySelector("svg");
            //svg.style.width = svg.style.height = "200px";
            //svg.style.background = ["pink","blue","red","green","hotpink","yellow"][random(0,5)];
            svg.onanimationend = (evt) => this.onthefloor(evt);
            this.drop();
            let location = (el) => {
                let centerX = el.offsetLeft + el.offsetWidth / 2;
                let centerY = el.offsetTop + el.offsetHeight / 2;
                return { x: centerX, y: centerY };
            }
            document.addEventListener("notifyFlake", (evt) => {
                if (this.id !== evt.detail.id) {
                    // console.log(location(this), location(evt.detail.element));
                    //       console.log(this.nodeName, getComputedStyle(this).width);
                }
            });
            function notify() {
                document.dispatchEvent(new CustomEvent("notifyFlake", {
                    bubbles: true,
                    composed: true,
                    detail: {
                        element: this,
                        id: this.id
                    }
                }));
            }
            requestAnimationFrame(notify.bind(this));
        }
        fallen(evt) {
            // console.warn(evt.type, this.nodeName);
            let mis = this.closest("make-it-snow");
            //mis.snow(1);
            console.log("disconnected", this.nodeName,mis);
        }
        disconnectedCallback() {
        }
    });
});
