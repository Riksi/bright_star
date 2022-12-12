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
    console.log(by)
    let elems = [title, by];
    elems.forEach((el) => {
        el.onmouseover = function() {
            document.body.style.backgroundImage = "url(" + imgs["1"] + ")";
        }
    })

    poemTextContainer.innerHTML = "";
    data.poem.forEach((line, lineId) => {
        let i = lineId + 1;
        let lineContainer = document.createElement("div");
        lineContainer.classList.add("line");
        let glossContainer = document.createElement("div");
        glossContainer.classList.add("gloss");
        document.body.appendChild(glossContainer);
        glossContainer.style.display = "none";
        glossContainer.style.position = "fixed";
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
                        console.log(j, j2Str, associatedImg);
                        break;
                    }
                }
                
                span.onmouseover = function() {
                    span.classList.add("highlight");
                    glossContainer.innerHTML = definition;
                    document.body.style.backgroundImage = "url(" + associatedImg + ")";
                    // move glossContainer to the right of the span
                    let rect = lineContainer.getBoundingClientRect();
                    let spanRect = span.getBoundingClientRect();
                    glossContainer.style.left = rect.right + "px";
                    glossContainer.style.top = spanRect.top + "px";
                    glossContainer.style.display = "block";
                    glossContainer.style.maxWidth = lineContainer.offsetWidth - spanRect.left + "px";

                    
                }
                span.onmouseout = function() {
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
    

}

window.onload = function() {
    renderPoem(data, imgs);
}