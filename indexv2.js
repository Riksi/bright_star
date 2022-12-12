// We are going to animate the poem
// Making one span at a time appear
// triggering the onmouseover event, 
// then the onmouseout event
// render as normal but let display = none

function getSubstring(str, start, end) {
    let substr;
    if(end === undefined) {
        substr = str.substring(start);
    } else {
        substr = str.substring(start, end);
    }
    return substr.replace(/ /g, "&nbsp;");
}

function renderPoem(data, imgs) {
    document.body.style.backgroundImage = "url(" + imgs["1"] + ")";
    // assume an object called data exists with
    // { title, by, poem, glossary }
    // where poem is an array of strings
    // glossary has the form { "1": [ [start, end,  "word", "definition" ] ] }

    // assume a container element exists with id="poem"
    // Each line of the poem should be wrapped in a <p class="line"></p> element
    // span constructed as follows:
    let poemContainer = document.getElementById("poem");
    let poemTextContainer = poemContainer.querySelector("#text");
    let title = poemContainer.querySelector("#title")
    let by = poemContainer.querySelector("#by")
    title.innerHTML = data.title;
    by.innerHTML = 'BY '+ "<a href=" + data.by_url +">" + data.by + "</a>"
    let elems = [title, by];
    let mouseoverEvents = {};
    let mouseoutEvents = {};

    elems.forEach((el) => {
        mouseoverEvents[el.id] = function() {
            let backgroundImgStyle = "url(" + imgs["1"] + ")";
            if(document.body.style.backgroundImage !== backgroundImgStyle){
                document.body.style.backgroundImage = backgroundImgStyle;
            }
        }
    })

    poemTextContainer.innerHTML = "";
    let glossContainer = document.createElement("div");
    glossContainer.classList.add("gloss");
    document.body.appendChild(glossContainer);
    glossContainer.style.display = "none";
    glossContainer.style.position = "fixed";
    data.poem.forEach((line, lineId) => {
        let i = lineId + 1;
        let lineContainer = document.createElement("div");
        lineContainer.classList.add("line");
        
        // let lineOuter = document.createElement("div");
        // lineOuter.classList.add("line-outer");
        // poemTextContainer.appendChild(lineOuter);

        if((""+i) in data.glossary) {
            let gloss = data.glossary[i];
            if(gloss.length > 0 && gloss[0][0] > 0) {
                let span = document.createElement("span");
                span.innerHTML = getSubstring(line, 0, gloss[0][0]);
                lineContainer.appendChild(span);
            }
            gloss.forEach((glossaryItem, idx) => {
                let [start, end, term, definition] = glossaryItem;
                let span = document.createElement("span");
                span.innerHTML = getSubstring(line,start, end);
                span.classList.add("tooltip");
                span.id = 'line-' + i + '' + start + '-' + end;

                let associatedImg;
                let j, j2Str;
                // go backwards through the glossary to find the first image
                for(j = lineId; j >= 0; j--) {
                    j2Str = (j + 1) + "";
                    if(j2Str in imgs) {
                        associatedImg = imgs[j2Str];
                        break;
                    }
                }
                
                mouseoverEvents[span.id] = function() {
                    if(!span.classList.contains("highlight")) span.classList.add("highlight");
                    glossContainer.innerHTML = definition;
                    let backgroundImgStyle = "url(" + associatedImg + ")";
                    if(document.body.style.backgroundImage !== backgroundImgStyle){
                        document.body.style.backgroundImage = backgroundImgStyle;
                    }
                    // move glossContainer to the right of the span
                    let rect = lineContainer.getBoundingClientRect();
                    let spanRect = span.getBoundingClientRect();
                    glossContainer.style.left = rect.right + "px";
                    glossContainer.style.top = spanRect.top + "px";
                    glossContainer.style.display = "block";
                    glossContainer.style.maxWidth = lineContainer.offsetWidth - spanRect.left + "px";

                    
                }
                mouseoutEvents[span.id] = function() {
                    span.classList.remove("highlight");
                    glossContainer.innerHTML = "";
                    glossContainer.style.display = "none";
                }
                lineContainer.appendChild(span);
                // add the next block from end to next start if not last block
                if(idx < (gloss.length - 1)) {
                    let span2 = document.createElement("span");
                    // replace spaces with &nbsp;
                    span2.innerHTML = getSubstring(line, end, gloss[idx + 1][0])
                    lineContainer.appendChild(span2);
                }
            })
            if (gloss.length > 0 && gloss[gloss.length - 1][1] < line.length) {
                let span = document.createElement("span");
                span.innerHTML = getSubstring(line, gloss[gloss.length - 1][1])
                lineContainer.appendChild(span);
            }

            
        } else {
            lineContainer.classList.add("line");
            lineContainer.innerHTML = line;
        }

        // lineOuter.appendChild(lineContainer);
        // lineOuter.appendChild(glossContainer);
        // lineOuter.style.height = lineContainer.offsetHeight + "px";
        poemTextContainer.appendChild(lineContainer);

    });

    
    
    // hide all spans
    // redefine onmouseover and onmouseout as separate functions
    // they will not be active when animation is running
    // but the functions can be called from the animation
    // make an object that maps the span id to the onmouseover and onmouseout functions


    // At the start no events are active
    // After play is done, all events are active
    // If play is clicked again, all events are removed
    
    // Assume a button with id="play" exists

    let spans = document.querySelectorAll(".line span");
    let playButton = document.getElementById("play");
    playButton.onclick = animate;

    addGlossEvents();

    function addGlossEvents() {
        for(let elemIdx in mouseoverEvents) {
            let elem = document.getElementById(elemIdx);
            elem.onmouseover = mouseoverEvents[elemIdx];
            elem.onmouseout = mouseoutEvents[elemIdx];
            if(elem.tagName==="SPAN") {
                elem.classList.add("dotted");
            }
        }
    }

    function removeGlossEvents() {
        for(let elemIdx in mouseoverEvents) {
            let elem = document.getElementById(elemIdx);
            elem.onmouseover = null;
            elem.onmouseout = null;
            if(elem.tagName==="SPAN") {
                elem.classList.remove("dotted");
            }
        }
    }

    let currentSpanIdx = 0;
    let timeOut;
    let timeOutTime = 1000;
    let resume = false;

    function pauseAnimation() {
        clearTimeout(timeOut);
        // play emoji
        playButton.innerHTML = '<i class="fa fa-play"></i>';
        playButton.onclick = animate;
        resume = true;
    }

    function animate() {
         
        // if paused and previous span had mouseout event, call it
        if(resume){
            if(currentSpanIdx > 0) {
                window.scrollBy(0, 5, "smooth");
                let prevSpan = spans[currentSpanIdx - 1];
                if(prevSpan.classList.contains("tooltip")) {
                    mouseoutEvents[prevSpan.id]();
                }
                playButton.innerHTML = '<i class="fa fa-pause"></i>';
                playButton.onclick = pauseAnimation;
                resume = false;
            } else {
                let prevSpan = spans[spans.length - 1];
                if(prevSpan.classList.contains("tooltip")) {
                    mouseoutEvents[prevSpan.id]();
                }
                addGlossEvents();
                playButton.innerHTML = "<i class='fa fa-play'></i>";
                playButton.onclick = animate;
                resume = false;
                return;
            }
            
        }
        
        if(currentSpanIdx === 0) {
            window.scrollTo(0, 0);
            
            playButton.innerHTML = '<i class="fa fa-pause"></i>';
            removeGlossEvents();
            playButton.onclick = pauseAnimation;

        } 

        let currentSpan = spans[currentSpanIdx];
        

        
        let mouseoverEvent = null;
        let mouseoutEvent = null;
        if(currentSpan.classList.contains("tooltip")) {
            currentSpan.classList.add("highlight");
            mouseoverEvent = mouseoverEvents[currentSpan.id];
            mouseoutEvent = mouseoutEvents[currentSpan.id];
        }
        if(mouseoverEvent !== null) mouseoverEvent();
        
        scrolled = false;
        if(currentSpanIdx === spans.length - 1) {
            currentSpanIdx = 0;
            timeOut = setTimeout(() => {
                if (mouseoutEvent !== null) mouseoutEvent();
                addGlossEvents();
                playButton.innerHTML = "<i class='fa fa-play'></i>";
                playButton.onclick = animate;
            }, timeOutTime);
            
        } else {
            currentSpanIdx++;
            
            timeOut = setTimeout(() => {
                // gradually scroll down
                window.scrollBy(0, 5, "smooth");
                if (mouseoutEvent !== null) mouseoutEvent();
                animate();
            }, timeOutTime);
        }

    }

}

function IsImageOk(img) {
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete) {
        return false;
    }

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (img.naturalWidth === 0) {
        return false;
    }

    // No other way of checking: assume it’s ok.
    return true;
}

window.onload = function() {
    // first create an hidden image element for each image
    // then wait until all images are loaded
    for(let key in imgs) {
        let img = document.createElement("img");
        img.className='placeholder'
        img.src = imgs[key];
        img.style.display = "none";
        document.body.appendChild(img);
    }

    let images = document.querySelectorAll(".placeholder");
    images = Array.from(images);
    let allLoaded = false;
    while(!allLoaded){
        for(let i=0; i<images.length; i++) {
            if(!IsImageOk(images[i])) {
                break;
            }
        }
        allLoaded = true;
    }
    console.log("all images loaded");

    renderPoem(data, imgs);
}