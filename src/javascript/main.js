// an array containing all of the elements in the page
let ALL_ELEMENTS = []

// map element ids to location in ALL_ELEMENTS
let PAGE_MAP = {}

// shortcut to access speech synthesizer
let VOICE_SYNTH = window.speechSynthesis

// global for index of first element on page (following controls)
// NOTE: will need to update based on elements (controls) we insert into the page
let MIN_INDEX = 11

// global for current index
let CURRENT_INDEX = MIN_INDEX

let SHOULD_READ = false

// global for highlight color
// default yellow
let HIGHLIGHT_COLOR = "#fff280"

function highlightElement(e) {
    e.style['background-color'] = HIGHLIGHT_COLOR
    e.style['text-decoration'] = "underline"
    e.style['color'] = "black"
}

function unhighlightElement(e) {
    e.style['background-color'] = ""
    e.style['text-decoration'] = ""
    e.style['color'] = ""
}

let CURRENT_ELEMENT = {
    setAndSpeak: async function (newElement) {
        this.value = newElement
        if (newElement.style.hidden !== true && newElement.style.visibility !== "none") {
            this.value = newElement
            unhighlightElement(newElement)
            let handler = HANDLERS[ROLES[newElement.tagName.toLowerCase()]]
            let speakString = handler(newElement)
            if (speakString !== "") {
                highlightElement(newElement)
                let audio = new SpeechSynthesisUtterance(speakString)
                VOICE_SYNTH.speak(audio)
                return new Promise(resolve => {
                    audio.onend = resolve
                })
            }
        }
    },
    value: null
}


window.onload = () => {
    // inject html elements before mapping out the page
    injectHtml()

    // map out the page to fill out PAGE_MAP array
    mapPage()

    let checkReading = async function () {
        return SHOULD_READ
    }

    // Set the highlight color for the page
    let select = document.getElementById("highlight-color");
    select.onchange = () => { HIGHLIGHT_COLOR = select.value }

    document.getElementById("start-reading").addEventListener("click", () => {
        console.log("start")
        // if (!SHOULD_READ) -- idea to handle multiple "read page" clicks (potentially return to later) -- messes up checkReading
        SHOULD_READ = true
        // restart reading page if at the end
        if (CURRENT_INDEX === ALL_ELEMENTS.length - 1) {
            CURRENT_INDEX = MIN_INDEX
        }
        let READING_LOOP = async function () {
            console.log(ALL_ELEMENTS.length)
            for (CURRENT_INDEX; CURRENT_INDEX < ALL_ELEMENTS.length; CURRENT_INDEX++) {
                if (await checkReading()) {
                    console.log(CURRENT_INDEX)
                    // in case we had just been stopped, unhighlight the previous thing
                    unhighlightElement(CURRENT_ELEMENT.value)
                    let newElement = ALL_ELEMENTS[CURRENT_INDEX]
                    await CURRENT_ELEMENT.setAndSpeak(newElement)
                } else {
                    highlightElement(CURRENT_ELEMENT.value)
                    console.log("Reading stopped")
                    break
                }
            }
        }
        READING_LOOP()
    })

    // event listener for clicking the stop reading button
    document.getElementById("stop-reading").addEventListener("click", () => {
        console.log("stop")
        VOICE_SYNTH.cancel();
        SHOULD_READ = false
    })

    // event listeners for arrow key presses and interacting using space
    window.addEventListener("keydown", async (event) => {
        let newElement;
        // potentially leave highlighting until restarting
        switch (event.key) {
            case "ArrowLeft" :
                // cancel the voice and prevent default
                event.preventDefault()
                VOICE_SYNTH.cancel();
                console.log("Going back")
                SHOULD_READ = false

                // in case we had just been stopped
                unhighlightElement(CURRENT_ELEMENT.value)

                // get the element before the one that's currently being read out
                CURRENT_INDEX = PAGE_MAP[CURRENT_ELEMENT.value.id] - 1
                console.log(CURRENT_INDEX)

                // make sure that the user can't get to our buttons
                if (CURRENT_INDEX < MIN_INDEX) {
                    CURRENT_INDEX = MIN_INDEX;
                }

                // speak and then unhighlight this element
                newElement = ALL_ELEMENTS[CURRENT_INDEX]

                // skip over invisible elements
                while (ROLES[newElement.tagName.toLowerCase()] === "invisible") {
                    CURRENT_INDEX -= 1

                    if (CURRENT_INDEX < MIN_INDEX) {
                        CURRENT_INDEX = MIN_INDEX
                        newElement = ALL_ELEMENTS[CURRENT_INDEX]
                        break;
                    }
                    newElement = ALL_ELEMENTS[CURRENT_INDEX]
                }

                await CURRENT_ELEMENT.setAndSpeak(newElement)
                // unhighlightElement(newElement)
                break;
            case "ArrowRight" :
                // cancel the voice and prevent default
                event.preventDefault()
                VOICE_SYNTH.cancel()
                console.log("Going forward")
                SHOULD_READ = false

                // in case we had just been stopped
                unhighlightElement(CURRENT_ELEMENT.value)

                // get the element before the one that's currently being read out
                CURRENT_INDEX = PAGE_MAP[CURRENT_ELEMENT.value.id] + 1
                console.log(CURRENT_INDEX)

                // make sure user can't go past length of ALL_ELEMENTS
                if (CURRENT_INDEX >= ALL_ELEMENTS.length) {
                    CURRENT_INDEX = ALL_ELEMENTS.length - 1
                }

                // speak and then unhighlight this element
                newElement = ALL_ELEMENTS[CURRENT_INDEX]

                while (ROLES[newElement.tagName.toLowerCase()] === "invisible") {
                    CURRENT_INDEX += 1

                    if (CURRENT_INDEX >= ALL_ELEMENTS.length) {
                        CURRENT_INDEX = ALL_ELEMENTS.length - 1
                        newElement = ALL_ELEMENTS[CURRENT_INDEX]
                        break;
                    }
                }

                await CURRENT_ELEMENT.setAndSpeak(newElement)
                // unhighlightElement(newElement)
                break;
            case "Enter" : {
                event.preventDefault()
                let e = CURRENT_ELEMENT.value
                if (e.tagName.toLowerCase() === "input") {
                    e.focus()
                } else {
                    // else, it will be a button or a link
                    e.click()
                }
                break;
            }
            case " " : {
                event.preventDefault()
                if (SHOULD_READ === false) {
                    document.getElementById("start-reading").click()
                } else {
                    document.getElementById("stop-reading").click()
                }
            }
        }
    })
}

const mapPage = () => {
    if (ALL_ELEMENTS.length === 0) {
        ALL_ELEMENTS = document.body.getElementsByTagName("*")
    }

    for (let i = 0; i < ALL_ELEMENTS.length; i++) {
        const currentElement = ALL_ELEMENTS[i]
        if (!currentElement.id) {
            currentElement.id = i
        }
        PAGE_MAP[currentElement.id] = i
    }

    // initialize CURRENT_ELEMENT to be the first thing in the page
    CURRENT_ELEMENT.value = ALL_ELEMENTS[MIN_INDEX]

}

const injectHtml = () => {
    //document.body.innerHTML += `<div id="sr" style="position: sticky; top: 0px; right: 0px;"> Screenreader </div>`
    const sr = document.createElement("div")
    sr.style.float = 'right'
    sr.id = 'sr'
    sr.style.position = "sticky"
    sr.style.top = '0'
    sr.style.right = '0'
    sr.style.zIndex = '999'
    // Add buttons to start/stop reading
    sr.innerHTML = `<button id="start-reading" style="margin-bottom:4px; margin-top:4px">Start Reading</button>`
    sr.innerHTML += `\n<button id="stop-reading">Stop Reading</button>`
    // Add drop-down to select highlight color
    sr.innerHTML += `<br>Highlight Color: <select name="highlight-color" id="highlight-color">
        <option value="#fff280">Yellow</option>
        <option value="#ffd29e">Orange</option>
        <option value="#c8ff70">Green</option>
        <option value="#9efff9">Cyan</option>
        <option value="#e6c7ff">Purple</option>
        <option value="">None</option>
    </select>`
    document.body.insertBefore(sr, document.body.firstChild)
}


// maps element categories to reading handlers (return strings)
// TODO: Read out title??
// TODO dealing with color?
let HANDLERS;
HANDLERS = {
    "text-only": function textOnlyHandler(element) {
        console.log("text-only")
        console.log(element)
        console.log(element.innerHTML)
        return element.innerHTML;
    },
    "text-with-tag": function textWithTagHandler(element) {
        if (element === "aside") {
            return "Now reading an " + element.tagName + " . " + element.innerHTML;
        } else {
            return "Now reading a " + element.tagName + " . " + element.innerHTML;
        }
    },
    "invisible": function invisibleHandler(element) {
        return "";
    },
    "link": function linkHandler(element) {
        console.log("link handled")
        console.log(element.href)
        document.getElementById("stop-reading").click()
        if (element.innerHTML !== element.href) {
            //TODO just reading part of the link out
            return "Link: " + element.innerHTML + " This link goes to: " + element.href + " Press enter to click" +
                " the link, or press space to continue reading.";
        } else {
            return "Link to: " + element.href + " Press enter to click the link, or press space to continue reading.";
        }

    },
    "button": function buttonHandler(element) {
        document.getElementById("stop-reading").click()
        return "This is a button that says " + element.innerHTML + " Press enter to click the button," +
            " or press space to continue reading.";
    },
    "nav": function navHandler(element) {
        return "This is a navigation pane.";
    },
    "caption": function captionHandler(element) {
        return "Caption: " + element.innerHTML;
    },
    "image": function imageHandler(element) {
        if (element.alt) {
            return "There is an image here displaying a " + element.alt;
        } else {
            return "There is an image here.";
        }
    },
    // TODO enumerate different types (e.g. color, datetime-local)/enrich?
    "input": function inputHandler(element) {
        document.getElementById("stop-reading").click()
        return "There is an interactive " + element.type + " element here." + " Press enter to type in " +
            " the text box, or press space to continue reading.";
    },
    "canvas": function canvasHandler(element) {
        if (!(element.innerHTML.trim === "")) {
            return "There is a graphic here displaying: " + element.innerHTML;
        } else {
            return "There is a graphic here."
        }
    },
    // sometimes <p> then <ul> => doesn't make sense
    "unordered-list": function unorderedListHandler(element) {
        return "This is a list.";
    },
    "ordered-list": function orderedListHandler(element) {
        return "This is an ordered list.";
    },
    // TODO handle properly -- connect to associated element
    "label": function labelHandler(element) {
        return "There is a label here. It says " + element.innerHTML;
    },
    "table": function tableHandler(element) {
        return "There is a table here." + element.innerHTML;
    },
    "th": function tableHeaderHandler(element) {
        if (element.scope) {
            if (element.scope === "col") {
                return "This is a column header. It says " + element.innerHTML;
            } else {
                return "This is a " + element.scope + " header. It says " + element.innerHTML;
            }
        } else {
            return "This is a header. It says " + element.innerHTML;
        }
    },
    "td": function tableDataHandler(element) {
        return "The data in this cell says " + element.innerHTML;
    },
    "tfoot": function tableFooterHandler(element) {
        return "This is a table footer. It contains " + element.innerHTML; // fix me
    },
    "audio": function audioHandler(element) {
        return "There is an audio file." // + element.src;
    },
    "fieldset": function fieldSetHandler(element) {
        return "There is a grouping of elements here." // TODO handle legend, etc.?
    },
    "form": function formHandler(element) {
        return "There is a field to submit information." // TODO clean up
    },
    "select": function selectHandler(element) {
        return "There is a dropdown menu.";
    },
    "progress": function progressBarHandler(element) {
        if (element.max && element.value) {
            return "There is a graphic here displaying progress of "
                + element.value + " out of " + element.max;
        } else if (element.value) {
            return "There is a graphic here displaying progress of "
                + element.value + " out of 1.";
        } else {
            return "There is a progress bar here."; // TODO clean up
        }
    },
    "text-area": function textAreaHandler(element) {
        return "There is a field here to enter text."; // TODO make interactive
    }


};
// maps element tag names to element categories
const ROLES = {
    "div": "text-only",
    "p": "text-only",
    "li": "text-only",
    "option": "text-only",
    "h1": "text-only",
    "h2": "text-only",
    "h3": "text-only",
    "h4": "text-only",
    "h5": "text-only",
    "h6": "text-only",

    "aside": "text-with-tag",
    "header": "text-with-tag",
    "footer": "text-with-tag",
    "blockquote": "text-with-tag",

    "script": "invisible",
    "article": "invisible",
    "main": "invisible",
    "section": "invisible",
    "cite": "invisible",
    "figure": "invisible",
    "time": "invisible",

    "figcaption": "caption",
    "caption": "caption",

    "canvas": "canvas",
    "svg": "canvas",

    "ul": "unordered-list",
    "ol": "ordered-list", // want to add more information here?

    "img": "image",
    "a": "link",
    "nav": "nav",
    "button": "button",
    "input": "input",
    "label": "label",
    "audio": "audio",

    "table": "table",
    "th": "th",
    "td": "td",
    "tfoot": "tfoot",
    "tr": "invisible", // handle me?

    "fieldset": "fieldset",
    "form": "form",
    "select": "select",
    "progress": "progress",
    "textarea": "text-area"

    //TODO the rest of the elements, and make sure this works
}