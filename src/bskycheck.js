const SVG_DIMENSIONS = `width="12" height="12"`;

const QUESTION_CIRCLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" ${SVG_DIMENSIONS} fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
</svg>`;

const CHECK_CIRCLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" ${SVG_DIMENSIONS} fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
</svg>`;

const X_CIRCLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" ${SVG_DIMENSIONS} fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
</svg>
`;

const ALL_SVGS = [QUESTION_CIRCLE_SVG, CHECK_CIRCLE_SVG, X_CIRCLE_SVG].join("");

function getAncestor(elem, count) {
  let rv = elem;
  for (let idx = 0; rv !== null && idx < count; idx++) {
    rv = rv.parentElement;
  }
  return rv;
}

function reqListener(twitterUsername) {
  return function () {
    let elems = document.querySelectorAll(
      `.bskycheck-link[data-username=${twitterUsername}]`
    );
    let bskyHandle = getBskyHandle(twitterUsername);
    if (this.status == 200) {
      for (let elem of elems) {
        elem
          .querySelectorAll("svg")
          .forEach((svg) => (svg.style.display = "none"));
        let style = elem.querySelector("svg.bi-check-circle").style;
        style.display = "inline";
        elem.classList.add("success");
        let url = getBskySocialProfileURL(getBskyHandle(twitterUsername));
        elem.querySelector("span").innerText = bskyHandle;
        elem.href = url;
        elem.target = "_blank";
        elem.title = `Go to ${bskyHandle}`;
      }
    } else if (this.status == 400) {
      for (let elem of elems) {
        elem
          .querySelectorAll("svg")
          .forEach((svg) => (svg.style.display = "none"));
        let style = elem.querySelector("svg.bi-x-circle").style;
        style.display = "inline";
        elem.classList.add("failure");
        elem.title = `${bskyHandle} does not exist`;
      }
    } else {
      console.error("Unknown error", this);
      for (let elem of elems) {
        let style = elem.querySelector("svg.bi-question-circle").style;
        elem.style.color = "#721c24";
        elem.querySelector("span").innerText = "Unknown error";
      }
    }
  };
}

function getBskySocialProfileURL(bskyHandle) {
  // Use staging before full launch
  return `https://staging.bsky.app/profile/${bskyHandle}`;
}

function getBskyHandle(twitterUsername) {
  // remove underscores ("the Grady_Booch rule")
  return twitterUsername.toLowerCase().replaceAll(/_/gi, "") + `.bsky.social`;
}

function bskyCheck(twitterUsername) {
  const req = new XMLHttpRequest();
  req.addEventListener("load", reqListener(twitterUsername));
  let bskyHandle = getBskyHandle(twitterUsername);
  let url = `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${bskyHandle}`;
  req.open("GET", url);
  req.send();
}

function bskyCheckClick(ev) {
  // ev is the svg
  let target = ev.target;
  while (target.tagName !== "A") {
    target = target.parentElement;
  }
  if (target.href !== undefined) {
    let username = target.dataset.username;
    if (username !== undefined) {
      bskyCheck(username);
    }
  }
  return false;
}

function bskyCheckAll() {
  let elems = document.querySelectorAll("a > div > span:not(.altered)");
  elems = Array.from(elems).filter((elem) => elem.innerText.startsWith("@"));
  for (let elem of elems) {
    let container = getAncestor(elem, 4);
    let elemUsername = elem.innerText.substring(1);
    elem.classList.add("altered");
    if (container !== null) {
      let parent = getAncestor(elem, 1);
      let sep = container.querySelector("div[aria-hidden=true]");
      if (sep !== null) {
        let cloned = sep.cloneNode();
        cloned.innerHTML = `· <a class="bskycheck-link">${ALL_SVGS}<span>bsky.social</span></a>`;
        let aElem = cloned.querySelector("a");
        aElem
          .querySelectorAll("svg")
          .forEach((svg) => (svg.style.display = "none"));
        aElem.querySelector("svg.bi-question-circle").style.display = "inline";
        aElem.addEventListener("click", bskyCheckClick);
        aElem.style.whiteSpace = "nowrap";
        aElem.title = `Check if ${elemUsername} is on bsky.social`;
        aElem.dataset.username = elemUsername;
        container.append(cloned);
      }
    }
  }
}

document.addEventListener("transitionend", (event) => {
  bskyCheckAll();
});
