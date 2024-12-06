!(() => {
  // favicon

  // IIFE so self-contained source can be copied into any other code

  // -------------------------------------------------------------------------- getUrlParam( param )
  const getUrlParam = (param) => {
    // extract parameter from URL
    let value = new URLSearchParams(window.location.search).get(param);
    if (value) return value;
    // extract parameter from <script src=""> URL
    if (document.currentScript === null) return null;
    const srcParams = new URLSearchParams(
      document.currentScript.src.split("?")[1]
    );
    value = srcParams.get(param);
    console.error(param, value);
    return value;
  };

  // ************************************************************************** configuration
  let LOG = getUrlParam("log") == "1";
  const _STARTFLAKECOUNT_ = ~~(getUrlParam("flakecount") || 300);
  const _ADDFLAKES_ = ~~(getUrlParam("addflakes") || 10);
  const _MAXFLAKES_ = ~~(getUrlParam("maxflakes") || 1000);
  const _INCREASEFLAKES_ = 5;
  const _DECREASEFLAKES_ = 5;
  const _SNOWFLAKESCALE_ = 0.5; // make size smaller
  const _MAX_NEWFLAKE_TIMEOUT_ = ~~(getUrlParam("maxnewflaketimout") || 3000);

  const UIpadding = 5;
  // -------------------------------------------------------------------------- user UI
  let _FPS_threshold_ = getUrlParam("fps") || 30;

  // **************************************************************************
  let settings = {
    // snow-flake SVG paths
    minstrokewidth: getUrlParam("minstrokewidth") || 3,
    maxstrokewidth: getUrlParam("maxstrokewidth") || 9,

    startflakecount: {
      label: "Number of snowflakes to start with",
      value: 300,
    },
    addflakecount: {
      label: "Number of snowflakes to add per second",
      value: 40,
    },
    animationspeed: {
      label: "Animation speed",
      value: [2, 20],
    },
  };
  // ========================================================================== GLOBAL variables
  let snowflakesCounter = 0; // number of snowflakes on screen
  let addflakeCounter = _ADDFLAKES_; // number of snowflakes to add when FPS is high enough
  //let snowflakesCreatedCounter = 0; // number of snowflakes created
  let FPS = 0; // frames per second

  // ========================================================================== Web Component settings
  // Web Component names
  const _WC_MAKEITSNOW_ = "make-it-snow";
  const _WC_SNOWFLAKE_ = "snow-flake"; // ❄️

  // random snow-flake color
  const snowcolors = [
    "snow",
    "ghostwhite",
    "floralwhite",
    "white",
    "ivory",
    "seashell",
    "honeydew",
    "aliceblue",
    "azure",
    "aliceblue",
    "lightcyan",
    "mintcream",
    "lavender",
  ];

  // ========================================================================== Helper functions
  // -------------------------------------------------------------------------- createElement( tag , props )
  const createElement = (tag, props = {}) => {
    const element = document.createElement(tag);
    return Object.assign(element, props);
  };
  // -------------------------------------------------------------------------- createSTYLEElement( css)
  const createSTYLEElement = (css) =>
    createElement("style", { textContent: css });
  // -------------------------------------------------------------------------- createCountElement( labelPrefix , top )
  const createCountElement = (labelPrefix, top) =>
    createElement("counter-display", { labelPrefix, top });
  // -------------------------------------------------------------------------- random( min , max )
  // multipurpose random function
  // min - can be integer or Array
  const random = (min, max) => {
    // if min is an Array, return random element from array
    if (Array.isArray(min)) return min[Math.floor(Math.random() * min.length)];
    // else return random value between min and max
    else return Math.random() * (max - min) + min;
  };

  // ************************************************************************** <snow-flake>
  customElements.define(
    _WC_SNOWFLAKE_,
    class extends HTMLElement {
      // ======================================================================
      // Getters and Setters, setters not really used in this code
      getAttributeUrl(attr) {
        // get value from attribute OR URL parameter OR CSS property
        let value = this.getAttribute(attr);
        value = value || getUrlParam(attr);
        value =
          value || getComputedStyle(this).getPropertyValue(`--${attr}`).trim();

        // if value indicates a - range, return random value between min and max
        if (value && value.includes("-")) {
          const [min, max] = value.split("-").map(Number);
          value = random(min, max);
        }
        // if value is a comma separated list, return random value from Array
        if (value && value.includes(",")) {
          const values = value.split(",");
          value = random(values); // return random value from Array
        }
        return value;
      }
      // ====================================================================== get color()
      get color() {
        return this.getAttributeUrl("color") || random(snowcolors);
      }
      set color(value) {
        this.setAttribute("color", value);
      }
      // ====================================================================== get x()
      // in 0 - 100 percentage range
      get x() {
        return this.getAttribute("x") || random(0, 100);
      }
      set x(value) {
        this.setAttribute("x", value);
      }
      // ====================================================================== get y()
      // in 0 - 100 percentage range
      get y() {
        return this.getAttribute("y") || random(-20, 0); // above top of screen
      }
      set y(value) {
        this.setAttribute("y", value);
      }
      // ====================================================================== get size()
      get size() {
        let size = this.getAttributeUrl("size") || 2;
        size = size * random(1, 6);
        return ~~size * _SNOWFLAKESCALE_;
      }
      set size(value) {
        this.setAttribute("size", value);
      }
      // ====================================================================== get rotate()
      // initial rotation of the snowflake (not animation)
      get rotate() {
        let rotate = 90;
        return this.getAttributeUrl("rotate") || random(-rotate, rotate);
      }
      set rotate(value) {
        this.setAttribute("rotate", value);
      }
      // ====================================================================== connectedCallback()
      connectedCallback() {
        this.attachShadow({ mode: "open" });
        if (LOG)
          console.log(
            `%c new <${_WC_SNOWFLAKE_}> `,
            "background:gold",
            snowflakesCounter
          );
        let spikecount =
          this.getAttributeUrl("spikecount") || random([4, 6, 8]);
        //---------------------------------------------------------------------- create HTML
        this.shadowRoot.innerHTML =
          `<style>` +
          `:host{display:inline-block;position:absolute}` +
          `:host{--size:var(--flakesize,${this.size}%);width:var(--size)}` +
          // CSS for SVG
          `svg{width:100%;vertical-align:top}` +
          `</style>` +
          // style declaration for the snowflake
          `<style id=animation><!--animation CSS injected here--></style>` +
          `<style id=style><!--initial state injected here--></style>` +
          // <svg> element with ice crystal
          // create an SVG ice crystal with random shapes
          `<svg part=crystal viewBox="0 0 140 140">` +
          // one <g> with random rotation at 70,70 center
          `<g id="spike" transform="rotate(${this.rotate} 70 70)" fill=none stroke-linecap=round >` +
          // create 3 paths making one of 6 crystal spikes
          // with random opacity and stroke-width
          // -------------------------------------------------------------------- create 3 spike <path>
          ["M70 70v-60", "M45 28l25 18l28-16", "M50 11l20 20l20-20"]
            .map((dpath) => {
              let strokewidth = random(
                settings.minstrokewidth,
                settings.maxstrokewidth
              );
              let pathopacity = random(0.2, 1);
              return `<path opacity="${pathopacity}" stroke-width="${strokewidth}" d="${dpath}"/>`;
            })
            .join("") +
          `</g>` +
          // -------------------------------------------------------------------- create 5 more spikes
          // rotate the crystal spike 5 times to create a snowflake
          Array(spikecount - 1) // from random([4,6,8])
            .fill(360 / spikecount) // calculate degrees offset for each spike
            .map((degrees, idx) => {
              let spikerotation = (idx + 1) * degrees; // all spikes make up a snowflake
              // every snowflake is in shadowDOM, so its save to reference ID values
              return `<use href=#spike transform="rotate(${spikerotation} 70 70)"/>`;
            })
            .join("") +
          // -------------------------------------------------------------------- end of SVG
          `</svg>`;

        // -------------------------------------------------------------------- position the snowflake
        // initial position
        this.position();
        // -------------------------------------------------------------------- animate the snowflake
        if (!this.hasAttribute("freeze")) this.animate({});
        this.onanimationend = (evt) => {
          // snowflake reached bottom of screen
          this.remove(); // triggers disconnectedCallback
        };
      }
      // ====================================================================== disconnectedCallback()
      disconnectedCallback() {
        if (LOG) console.log("disconnected");
        snowflakesCounter--;
      }
      // ====================================================================== position( x , y , color )
      // hardcode x,y and color to show a snowflake at a specific position
      // animation position is NOT done with this function
      position(x = this.x, y = this.y, color = this.color) {
        this.x = x;
        this.y = y;
        this.shadowRoot.querySelector("#style").innerHTML =
          `#spike{stroke:${color}}` +
          `:host{` +
          `  left:calc(${x}% - calc(var(--size) / 2));` +
          `  top :calc(${y}% - calc(var(--size) / 2))` +
          `}`;
      }

      // ====================================================================== get/set for animation
      // ---------------------------------------------------------------------- get speed()
      get animspeed() {
        return ~~(this.getAttributeUrl("speed") || random(4, 12)); // seconds
      }
      // ---------------------------------------------------------------------- get drift()
      get drift() {
        let d = this.getAttributeUrl("drift") || 5;
        return random(-d, d);
      }
      // ---------------------------------------------------------------------- get rotate()
      get cssrotate() {
        let rotate = this.getAttributeUrl("cssrotate") || 2;
        rotate = rotate * random(-360, 360);
        return ~~rotate;
      }
      get animstyle() {
        return this.getAttributeUrl("animstyle") || "linear";
      }
      // ====================================================================== animate({ speed , drift , rotate , x , y , offset , left , top })
      animate({
        // user can override the default values
        speed = this.animspeed,
        cssrotate = this.cssrotate,
        x = this.x,
        y = this.y,
        top = "120%", //`calc(${100}% + 1 * var(--size))`, // move offscreen at bottom
        drift = this.drift,
      }) {
        let leftpos = [~~x];
        for (let i = 1; i < 6; i++) {
          let lastValue = leftpos[leftpos.length - 1];
          let newValue = lastValue + drift;
          leftpos.push(~~newValue);
        }
        // if (
        //   leftpos.every(
        //     (val, i, arr) => i === 0 || Math.abs(val - arr[i - 1]) === 5
        //   )
        // ) {
        //   console.error(leftpos);
        // }
        // leftpos[5] = leftpos[4] = leftpos[3];

        // this.position(x);
        // -------------------------------------------------------------------- X % pos falling down
        // create 4 intermediate states for the snowflake between 0% and 100%
        let xpos = Array.from(
          { length: 4 },
          (_, i) => Math.random() * (100 - (i + 1) * 20) + (i + 1) * 20
        );
        // -------------------------------------------------------------------- create the animation
        //todo pause?
        this.shadowRoot.querySelector("#animation").innerHTML =
          `@keyframes flakefall{` +
          // start state 0%
          `0%{left:${leftpos[0]};top:calc(-2 * var(--size));transform:rotate(0deg)}` +
          // intermediate animation states for n% n+1% n+2% n+3%
          xpos.map((x, idx) => `${~~x}%{left:${leftpos[idx]}%}`).join("") +
          // end state 100%
          `100%{left:${leftpos[5]}%;top:${top};transform:rotate(${cssrotate}deg)}` +
          // end keyframes
          `}` +
          `:host{animation:flakefall ${speed}s ${this.animstyle} 0s forwards}`;
      }
      // ---------------------------------------------------------------------- stop()
      stop() {
        this.shadowRoot.querySelector("#animation").innerHTML = "";
      }
      // ======================================================================
    } // class HTMLElement
  ); // customElements.define

  // ************************************************************************** <make-it-snow>
  customElements.define(
    _WC_MAKEITSNOW_,
    class extends HTMLElement {
      // ====================================================================== observedAttributes()
      static get observedAttributes() {
        return ["startflakecount", "addflakecount", "animationspeed"];
      }
      // ====================================================================== constructor()
      connectedCallback() {
        this.renderonce();
      } // connectedCallback()
      // ====================================================================== renderonce()
      renderonce() {
        // --------------------------------------------------------------------
        // make sure this function is only called once, yes, a semaphore could have been used
        this.renderonce = () => {};
        // --------------------------------------------------------------------
        let quotes =
          getUrlParam("ui") == "no"
            ? createElement("span") // empty span
            : createElement("snowflake-quotes");
        // --------------------------------------------------------------------
        document.body.append(
          createElement("frames-per-second", { id: "FPS" }),
          (this.flakecounter = createCountElement(
            "<snow-flake> Web Components : ",
            42
          )),
          (this.addflakecounter = createCountElement(
            "new <snow-flake> per second: ",
            77
          )),
          (this.navigatormemorycounter = createCountElement(
            "Device Memory: ",
            112
          )),
          (this.memorycounter = createCountElement("Memory: ", 148)),
          // add quotes text in bottom left
          quotes
        );

        // --------------------------------------------------------------------
        // generate snowflakes on request
        document.addEventListener(_WC_MAKEITSNOW_, (evt) => {
          // data
          if (!this.lastUpdateTime || Date.now() - this.lastUpdateTime >= 500) {
            this.flakecounter.label = snowflakesCounter;
            this.addflakecounter.label = addflakeCounter;
            this.memorycounter.label = `${(
              performance.memory.usedJSHeapSize / 1e6
            ).toFixed(2)} MB`;
            this.navigatormemorycounter.label = `${(
              navigator.deviceMemory / 1e6
            ).toFixed(2)} MB`;
            this.lastUpdateTime = Date.now();
          }

          const flake = document.createElement(_WC_SNOWFLAKE_);
          //flake.setAttribute("x", Math.random() * 100);
          //flake.setAttribute("y", 0);
          this.append(flake);
          snowflakesCounter++;
        });
        // --------------------------------------------------------------------
        // create initial snow flakes
        for (let i = 0; i < _STARTFLAKECOUNT_; i++) {
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent(_WC_MAKEITSNOW_));
          }, (i * 4e3) / _STARTFLAKECOUNT_);
        }
      }
      // ======================================================================
    } // class HTMLElement
  ); // customElements.define

  // ************************************************************************** <counter-display>
  // display a counter with label prefix
  customElements.define(
    "counter-display",
    class extends HTMLElement {
      // ====================================================================== connectedCallback()
      #count = 0;
      #label = "";
      connectedCallback() {
        this.attachShadow({ mode: "open" }).append(
          createSTYLEElement(
            `:host{position:fixed;z-index:999;opacity:.7;` +
              `display:var(--snow-ui-display, inherit);` +
              `top:${this.top || UIpadding}px;left:${UIpadding}px;` +
              `background:#000;color:#fff;` +
              `padding:5px;border-radius:5px;` +
              `font:18px arial}`
          ),
          (this.div = createElement("div", {
            part: "div",
            textContent: "updating...",
          }))
        );
      }
      // ====================================================================== get top()
      get top() {
        return this.getAttribute("top") || 10;
      }
      set top(value) {
        this.setAttribute("top", value);
      }
      // ====================================================================== getset
      get labelPrefix() {
        return this.#label;
      }
      set labelPrefix(value) {
        this.#label = value;
      }
      // ====================================================================== get count()
      get count() {
        return this.#count;
      }
      set count(value) {
        this.label = this.#count = value;
      }
      // ====================================================================== get label()
      get label() {
        return this.div.textContent;
      }
      set label(str) {
        this.div.textContent = (this.labelPrefix || "") + str;
      }
    } // class CounterDisplay
  ); // customElements.define("counter-display")

  // ************************************************************************** <frames-per-second>
  customElements.define(
    "frames-per-second",
    class extends HTMLElement {
      // ====================================================================== connectedCallback()
      connectedCallback(
        lastFrameTime = 0,
        counterElement // reference to UI element
      ) {
        // -------------------------------------------------------------------- create FPS counter
        const createFPSCounter = () => {
          return (counterElement = createCountElement(
            `animation FPS (threshold:${_FPS_threshold_} ⬆️⬇️) : `,
            UIpadding
          ));
        };
        // -------------------------------------------------------------------- create DOM
        this.attachShadow({ mode: "open" }).append(
          (counterElement = createFPSCounter())
        );

        // -------------------------------------------------------------------- FPS counter
        let fpsFunc = (currentTime) => {
          FPS++; // GLOBAL!
          // only update every second
          if (currentTime - lastFrameTime >= 1e3) {
            lastFrameTime = currentTime;
            counterElement.label = FPS;
            if (
              FPS > _FPS_threshold_ &&
              _STARTFLAKECOUNT_ > 0 &&
              snowflakesCounter < _MAXFLAKES_
            ) {
              addflakeCounter += _INCREASEFLAKES_;
              for (let i = 0; i < addflakeCounter; i++) {
                setTimeout(() => {
                  document.dispatchEvent(new CustomEvent(_WC_MAKEITSNOW_));
                }, random(0, _MAX_NEWFLAKE_TIMEOUT_));
              }
            } else {
              addflakeCounter -= _DECREASEFLAKES_;
              if (addflakeCounter < 0) addflakeCounter = 1;
            }
            FPS = 0;
          }
          requestAnimationFrame(fpsFunc);
        };
        requestAnimationFrame(fpsFunc);
        // -------------------------------------------------------------------- change FPS threshold
        document.addEventListener("keyup", (event) => {
          let offset = event.ctrlKey ? 10 : 1;
          if (event.key === "ArrowUp") {
            _FPS_threshold_ = Math.min(_FPS_threshold_ + offset, 60);
          } else if (event.key === "ArrowDown") {
            _FPS_threshold_ = Math.max(_FPS_threshold_ - offset, 1);
          }
          counterElement.replaceWith((counterElement = createFPSCounter()));
        });
        // -------------------------------------------------------------------- end of connectedCallback
      } // connectedCallback()
    } // class FPSElement
    // ========================================================================
  ); // customElements.define("frames-per-second")

  // ************************************************************************** <snowflake-quotes>
  customElements.define(
    "snowflake-quotes",
    class extends HTMLElement {
      connectedCallback() {
        // -------------------------------------------------------------------------- quotes array
        const quotes = [
          "You are not a special snowflake.--Sophia Amoruso",
          // "Nature is full of genius, full of the divinity; so that not a snowflake escapes its fashioning hand.--Henry David Thoreau",
          "No snowflake in an avalanche ever feels responsible.--Stanislaw Jerzy Lec",
          "It's so fascinating to think about how each snowflake is completely individual - there are millions and millions of them, but each one is so unique.--Kate Bush",
          // "I am not a snowflake. I am not a sweet symbol of fragility and life. I am a strong, fierce, flawed adult woman. I plan to remain that way, in life and in death.--Stella Young",
          "They say that every snowflake is different. If that were true, how could the world go on? How could we ever get up off our knees? How could we ever recover from the wonder of it?--Jeanette Winterson",
          // "I think it just takes one little snowflake to start a snowball to go down the hill. My contribution and, say, Kendrick Lamar's and some chosen others' start the snowball. That's all I can hope for. I don't know if I'm comfortable being quote-unquote a leader.--D'Angelo",
          // "It's fitting that an insult largely aimed at youth has made children of those who use it. 'Snowflake' reminds us how much we need climate change... in politics.--Faith Salie",
          "Every avalanche begins with the movement of a single snowflake, and my hope is to move a snowflake.--Thomas Frey",
          "You are not a beautiful, unique snowflake... This is your life, and it's ending one minute at a time.--Chuck Palahniuk",
          // "I'm a snowflake. And so are you. Your children are snowflakes. And so are mine. And those who protest the loudest about not being snowflakes? I can see your six-fold ice crystals from here! Because every person, empirically, is unique.--Faith Salie",
          // "A snowflake is another beautifully ordered example of what simple, natural meteorological processes can produce. Stars form by gravity, collapsing into spherically ordered structures that can remain in this form only if they release tremendous heat energy into the environment.--Lawrence M. Krauss",
          // "I grew up thinking I was going to change the world, but not because I was treated like a special snowflake. It's a silly label. People are starving. We need to feed them. That's the end of the conversation.--Rupi Kaur",
          // "You've seen it in the news - the radical left in our country, stinging from their 2016 election losses, has become increasingly desperate and unhinged. They want nothing more than to push their snowflake agenda on the entire nation, and our conservative Georgia values are under attack like never before.--Brian Kemp",
          // "What's wrong with being a snowflake? I think if you're calling someone a snowflake that just means you've been upset by something they're saying. We're all vulnerable, get over it.--Mura Masa",
          "I want people to know their palate is a snowflake. We all like different things. Why should we all have the same taste in wines?--Gary Vaynerchuk",
        ];
        // -------------------------------------------------------------------------- init
        let current;
        let interval;
        // -------------------------------------------------------------------------- functions
        const quoted = (idx) =>
          `${idx + 1} of ${quotes.length}<br><br>` +
          quotes[(current = idx)].replace("--", "<br><br>-- ");
        const start = (time = 1e3) =>
          (interval = setInterval(() => next(), Math.max(2e3, time)));
        const next = () => {
          clearInterval(interval);
          let text = quoted((current + 1) % quotes.length);
          start(text.length * 60);
          this.div.innerHTML = text;
        };
        // -------------------------------------------------------------------------- create HTML
        const createElement = (tag, props = {}) =>
          Object.assign(document.createElement(tag), props);

        this.attachShadow({ mode: "open" }).append(
          createElement("style", {
            textContent:
              `:host{display:var(--snow-ui-display, block);position:fixed;bottom:${UIpadding}px;left:${UIpadding}px;max-width:300px;` +
              `background:var(--quotebackground,beige);color:black;opacity:0.75;` +
              `padding:${UIpadding}px;border-radius:5px;border:1px solid darkred;` +
              `text-align:left;font:18px Arial}`,
          }),
          (this.div = createElement("div", {
            innerHTML: quoted(0),
          }))
        );
        // -------------------------------------------------------------------------- event listeners
        this.onmouseover = () => clearInterval(interval);
        this.onmouseout = () => start();
        this.onclick = () => next();

        start(); // start the interval
      } // connectedCallback()

      // disconnectedCallback() {
      // no need! Listeners are garbage collected
      // }
    }
  );
  // ************************************************************************** Wake Lock API
  let wakeLock = null;

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      console.log("Wake Lock is active");
      wakeLock.addEventListener("release", () => {
        console.log("Wake Lock was released");
      });
    } catch (err) {
      if (LOG) console.error(`${err.name}, ${err.message}`);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLock !== null) {
      wakeLock.release().then(() => {
        wakeLock = null;
      });
    }
  };

  // Request wake lock when the document is visible
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  });

  // Request wake lock initially
  requestWakeLock();
})(); // IIFE
