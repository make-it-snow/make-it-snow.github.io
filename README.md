# https://make-it-snow.github.io

[Play Youtube - Make it so! (Captain Picard)](https://www.youtube.com/watch?v=xteKObnaA2c)


## Zach his &lt;snow-fall> Web Component

https://zachleat.github.io/snow-fall/demo.html

Is a single Web Component creating 200 snow-**ball** DIVs falling down the screen.

![alt text](https://i.imgur.com/z58oQjW.png)

## Which made me wonder

What if instead of **one** Web Component...  
... each snowball would be a _unique_ Web Component &lt;snow-flake>?

# &lt;make-it-snow> Web Component
## an experiment in more and more Web Components

* Every snowflake is a unique Web Component &lt;snow-flake> with an SVG image.
* Snowflakes are animated with CSS to fall down rotating and drift sideways.  
* Snowflakes are removed from the DOM when they reach the bottom of the screen (``onanimationend``).
* Instead of a fixed amount of snowflakes **more** snowflakes are added every second. 
* CSS animation FPS (Frames Per Second) is tracked.  
When FPS is above a _threshold_ **more** new snowflakes (Web Components) are added at the top of the screen (5 more every second). Below the _treshold_ less snowflakes are added.

FPS can be changed with UP and DOWN arrow keys (once a second, hold down CTRL for 10x).

On my slow? system I get about **400** total snowflakes on screen:

![alt text](https://i.imgur.com/k1qcGGH.png)

## Creating a unique SVG snowflake

#### Create one "spike" from 3 SVG paths with random width and opacity

````js
<g id="spike">
    ["M70 70v-60", 
    "M45 28l25 18l28-16", 
    "M50 11l20 20l20-20"]
    .map( (dpath) => {
        let width = random(3 , 9);
        let opacity = random(0.2 , 1);
        return `<path opacity="${opacity}" stroke-width="${width}" d="${dpath}"/>`;
    })
</g>
````

![alt text](https://i.imgur.com/2r0hVmm.png)

#### Rotate each _spike_ of 4,6 or8 times

````javascript
Array(spikecount - 1) // from random([4,6,8])
.fill(360 / spikecount) // calculate degrees offset for each spike
.map((degrees, idx) => {
    let spikerotation = (idx + 1) * degrees; // all spikes make up a snowflake
    // every snowflake is in shadowDOM, so its save to reference ID values
    return `<use href=#spike transform="rotate(${spikerotation} 70 70)"/>`;
})

````

That will create all unique SVG snowflakes:

![alt text](https://i.imgur.com/Fq3TZ5C.png)

## URL parameters and Attributes

The &lt;make-it-snow> Web Component can be configured with URL parameters or Attributes.

### URL examples

https://make-it-snow.github.io/?flakecount=400 (already too much for my system)
https://make-it-snow.github.io/?size=4&spikecount=4&color=gold&speed=2


### parameters

URL parameters only
| Parameter | Description | Default Value |
|-----------|-------------|---------------|
| `flakecount` | Number of snow flakes to start with | `300` |
| `addflakes` | Number of snow flakes to add every second | `20` |
| `fps`    | FPS threshold, change with arrow up/down keys | `30` |
| `minstrokewidth`    | minimal SVG path width | `3` |
| `maxstrokewidth`    | maximum SVG path width | `3` |


&lt;make-it-snow> Attributes OR URL parameters
| Attribute | Description | Default Value |
|-----------|-------------|---------------|

&lt;snow-flake> Attributes OR URL parameters
| Attribute | Description | Default Value |
|-----------|-------------|---------------|
| `color`    | (string/csv) snowflake color | random[internal colors] |
| `size`   | (decimal) snowflake size | 2 |
| `rotate`   | (int) initial start state | `90` |
| `spikecount`   | (int/array) number of snowflake spike | `[4,6,8]` |
| `speed`   | (int) fall down speed (seconds) | `[4 - 12]` |
| `drift`   | (int) sideways motion | `[-5 - 5]` |
| `size`    | default size | `1` |
| `opacity` | default opacity | `1` |
| `cssrotation` | CSS rotation | `random(-360,360)` |

## Observations

Feel free to add more in the comments

* ...