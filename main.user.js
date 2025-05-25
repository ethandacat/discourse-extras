// ==UserScript==
// @name         Discourse Extras
// @namespace    ethandacatProductions
// @version      2.1
// @description  More for viewing, less for writing.
// @author       ethandacat
// @match        https://x-camp.discourse.group/*
// @icon         https://d3bpeqsaub0i6y.cloudfront.net/user_avatar/meta.discourse.org/discourse/48/148734_2.png
// @grant       GM_setClipboard
// @downloadURL  https://github.com/ethandacat/flask-hello-world/raw/refs/heads/main/api/world/d-extra/d-extra.user.js
// @updateURL    https://github.com/ethandacat/flask-hello-world/raw/refs/heads/main/api/world/d-extra/d-extra.user.js
// ==/UserScript==

function encodeObfuscated(str, key) {
  let strBytes = new TextEncoder().encode(str);
  let keyBytes = new TextEncoder().encode(key);
  let encodedBytes = strBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
  let base64 = btoa(String.fromCharCode(...encodedBytes));
  return "XxH@" + base64.split("").reverse().join("") + "@HxX";
}

function decodeObfuscated(obfStr, key, triedFallback = false) {
  try {
    let cleaned = obfStr.replace(/^XxH@/, "").replace(/@HxX$/, "");
    let reversed = cleaned.split("").reverse().join("");
    let decodedStr = atob(reversed);
    let decodedBytes = new Uint8Array([...decodedStr].map(c => c.charCodeAt(0)));

    let keyBytes = new TextEncoder().encode(key);
    let originalBytes = decodedBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
    let cem = new TextDecoder().decode(originalBytes);

    if (!cem.startsWith("dextrapm")) {
      if (!triedFallback && key !== "discourse") {
        return decodeObfuscated(obfStr, "discourse", true);
      }
      return "[This message is NOT for you!]";
    }

    return cem.replace("dextrapm", "");
  } catch (e) {
    if (!triedFallback && key !== "discourse") {
      return decodeObfuscated(obfStr, "discourse", true);
    }
    return "[This message is NOT for you!]";
  }
}



function descCode(element) {
    while (element) {
        if (element.tagName && element.tagName.toLowerCase() === 'code') {
            return true;
        }
        element = element.parentElement;
    }
    return false;
}

function gText(element) {
    const avoid = /<*>/
    const regex = /!\{(.*?)\}/g; // Match !{stuff} normally
    const matches = [];
    const input = element.innerHTML;
    // Replace !{stuff} with an empty string and store the matches
    const cleanedText = input.replace(regex, (match, p1) => {
        var mna;
        const ql = p1.split(" ");
        const cmd = ql[0];
        const arg = ql[1];
        const argt = ql.slice(2).join(" ");
        switch (cmd) {
            case "phantom":
                mna = "";
                break;
            case "bgc":
                mna = `<span style="background-color:${arg}">`;
                break;
            case "color":
                mna = `<span style="color:${arg}">`;
                break;
            case "style":
                mna = `<span style="${arg} ${argt}">`;
                break;
            case "s":
                mna = "</span>";
                break;
            case "size":
                mna = `<span style="font-size:${arg}px;">`;
                break;
            case "codepen":
                mna = `<iframe src="https://cdpn.io/${arg}/fullpage/${argt}?view=" frameborder="0" width="90%" height="600px" style="clip-path: inset(120px 0 0 0); margin-top: -120px;"></iframe>`;
                break;
            case "embed":
                var pw = `${arg} ${argt}`.replace("<a href=\"","");
                mna = `<iframe rel="" style="width:900px;height:600px;" src="${pw}" frameborder="0"></iframe>`;
                break;
            case "mention":
                mna = `<a class='mention'>${arg} ${argt}</a>`;
                break;
            case "pm":
                try{
                var username = document.querySelector("img.avatar").src.split("/")[6];
                var argspl = arg.split("|:|")
                var arg1 = decodeObfuscated(argspl[0],username)
                var arg2 = decodeObfuscated(argspl[1],username)
                if (arg1=="[This message is NOT for you!]"&&arg2=="[This message is NOT for you!]"){
                    mna = `<blockquote>[This message is NOT for you!]</blockquote>`;
                    break;
                }
                else if (arg1=="[This message is NOT for you!]") {
                    mna = `<blockquote>${arg2}</blockquote>`
                    break;
                }
                mna = `<blockquote>${arg1}</blockquote>`;
                }catch{
                mna = `<blockquote>Incorrectly formatted message</blockquote>`
                }
                break;
            default:
                mna = "<span style='color:red; background-color:yellow; padding:1px; margin:1px; border: 1px solid red; '>Invalid Discourse Extras Tag!</span>";
                break;

        }
        return mna; // Remove the matched pattern
    });

    return cleanedText.trim();
}

// Function to process .cooked elements
function processCookedElement(element) {
    const result = gText(element); // Get cleaned text and extracted content
    element.innerHTML = result; // Update the element's innerHTML
}

// Create a MutationObserver to watch for added nodes
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            // Check if the added node is an element
            if (node.nodeType === Node.ELEMENT_NODE) {
                // If it's a .cooked element, process it
                if (node.classList.contains('cooked')) {
                    processCookedElement(node);
                }
                // If the added node has children, check them for .cooked elements
                node.querySelectorAll('.cooked').forEach(cookedElement => {
                    processCookedElement(cookedElement);
                });
            }
            // Check if the added node is an element
            if (node.nodeType === Node.ELEMENT_NODE) {
                // If it's a .cooked element, process it
                if (node.classList.contains('chat-message-text')) {
                    processCookedElement(node);
                }
                // If the added node has children, check them for .cooked elements
                node.querySelectorAll('.chat-message-text').forEach(cookedElement => {
                    processCookedElement(cookedElement);
                });
            }
            // Check if the added node is an element
            if (node.nodeType === Node.ELEMENT_NODE) {
                // If it's a .cooked element, process it
                if (node.classList.contains('d-editor-preview')) {
                    processCookedElement(node);
                }
                // If the added node has children, check them for .cooked elements
                node.querySelectorAll('.d-editor-preview').forEach(cookedElement => {
                    processCookedElement(cookedElement);
                });
            }
        });
    });
});

// Start observing the document for changes
observer.observe(document.body, {
    childList: true, // Observe direct children
    subtree: true // Observe all descendants
});

// Initial processing of existing .cooked elements
document.querySelectorAll('.cooked').forEach(processCookedElement);

function doit(){
    var droot = document.querySelector(".discourse-root");
    var html = `<div class="modal-container">


    <div class="modal d-modal create-invite-modal" data-keyboard="false" aria-modal="true" role="dialog" aria-labelledby="discourse-modal-title">
        <div class="d-modal__container">


            <div class="d-modal__header">


<!---->
                <div class="d-modal__title">
                  <h1 id="discourse-modal-title" class="d-modal__title-text">Encode Message</h1>

<!---->

                </div>




    <button class="btn no-text btn-icon btn-transparent modal-close dextra-hailnah2" title="close" type="button">
<svg class="fa d-icon d-icon-xmark svg-icon svg-string" xmlns="http://www.w3.org/2000/svg"><use href="#xmark"></use></svg>      <span aria-hidden="true">
          ​
        </span>
    </button>


                          </div>


<!---->


<!---->

          <div class="d-modal__body" tabindex="-1">

            <p>
              Copy text that will create a secret message.
            </p>
            <br>
            Text to be displayed
            <textarea class="dextra-yay" style="resize:none;"></textarea>
            <br>
            User to be sent to (set blank to be visible to everyone)
            <input type="text" class="dextra-useryay">

          </div>

            <div class="d-modal__footer">



    <button class="btn btn-text btn-primary dextra-lesgo" autofocus="true" type="button">
<!----><span class="d-button-label">Copy and close<!----></span>
    </button>




    <button class="btn btn-text btn-transparent dextra-hailnah" type="button">
<!----><span class="d-button-label">Cancel<!----></span>
    </button>



            </div>


        </div>
      </div>

        <div class="d-modal__backdrop"></div>
    </div>`
    var ele = document.createElement("div");
    var key = "";
    ele.innerHTML = html;
    ele.querySelector(".dextra-lesgo").onclick = function(){
        if (document.querySelector(".dextra-yay").value == "") {
            alert("gib me text")
            return;
        }
        var val = document.querySelector(".dextra-yay").value;
        if (document.querySelector(".dextra-useryay").value == "") {
            key = "discourse";
        }else{
            key = document.querySelector(".dextra-useryay").value;
        }
        var username = document.querySelector("img.avatar").src.split("/")[6];
        GM_setClipboard("!{pm "+encodeObfuscated("dextrapm"+val, key)+"|:|"+encodeObfuscated("dextrapm"+val,username)+"}");
        ele.remove();
    }
    ele.querySelector(".dextra-hailnah").onclick = function() {ele.remove()}
    ele.querySelector(".dextra-hailnah2").onclick = function() {ele.remove()}
    droot.appendChild(ele);
}

setTimeout(function(){
const bcode = `
          <a id="ember5" class="ember-view sidebar-section-link sidebar-row" title="All topics" data-link-name="dextra" href="javascript:void(0)">
      <span class="sidebar-section-link-prefix icon">
          <svg class="fa d-icon d-icon-layer-group svg-icon prefix-icon svg-string" xmlns="http://www.w3.org/2000/svg"><use href="#code"></use></svg>
</span>
            <span class="sidebar-section-link-content-text">
              Encode Message
            </span>
</a>
`
var ab = document.createElement("li");
    ab.classList = "sidebar-section-link-wrapper"
    ab.innerHTML = bcode;
    ab.onclick = doit;
    document.querySelector("#sidebar-section-content-community").appendChild(ab);
}, 1000)
