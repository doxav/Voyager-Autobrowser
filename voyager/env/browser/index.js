import express from "express";
import puppeteer from "puppeteer";
import fs from "fs";

let page;
let browser;
let eventsCache = [];

async function getPageTextContent() {
  // Get page content as text
  const textContent = await page.evaluate(() => {
    return document.body.innerText;
  });

  return textContent;
}

const defaultClickables = [
  "HTMLButtonElement",
  "HTMLAnchorElement",
  "HTMLInputElement",
  "HTMLTextAreaElement",
  "HTMLLabelElement",
  "HTMLFieldSetElement",
  "HTMLLegendElement",
  "HTMLOptGroupElement",
  "HTMLOptionElement",
  "HTMLDataListElement",
  "HTMLMeterElement",
  "HTMLProgressElement",
  "HTMLSelectElement",
  "HTMLDetailsElement",
  "HTMLDialogElement",
  "HTMLMenuElement",
  "HTMLMenuItemElement",
  "HTMLSummaryElement",
  "HTMLTrackElement",
  "HTMLVideoElement",
  "HTMLAudioElement",
  "HTMLSourceElement",
];

async function getClickableElements() {
  const session = await page.target().createCDPSession();

  // Unique value to allow easy resource cleanup
  // random value
  const objectGroup = "clickable-elements-" + Math.random();

  // Evaluate query selector in the browser
  const {
    result: { objectId },
  } = await session.send("Runtime.evaluate", {
    expression: `document.querySelectorAll("*")`,
    objectGroup,
  });

  // Using the returned remote object ID, actually get the list of descriptors
  const { result } = await session.send("Runtime.getProperties", { objectId });

  // Filter out functions and anything that isn't a node
  const descriptors = result
    .filter((x) => x.value !== undefined)
    .filter((x) => x.value.objectId !== undefined)
    .filter((x) => x.value.className !== "Function");

  const elements = [];

  for (const descriptor of descriptors) {
    const objectId = descriptor.value.objectId;
    let isClickable = false;
    if (defaultClickables.includes(descriptor.value.className)) {
      isClickable = true;
    } else {
      const { listeners } = await session.send(
        "DOMDebugger.getEventListeners",
        {
          objectId,
        }
      );
      if (
        listeners.some((l) =>
          ["click", "mousedown", "mouseup"].includes(l.type)
        )
      ) {
        isClickable = true;
      }
    }

    if (isClickable && !elements.find((e) => e.id === descriptor.name)) {
      const { result: text } = await session.send("Runtime.callFunctionOn", {
        objectId,
        functionDeclaration: "function() { return this.innerText }",
        returnByValue: true,
        objectGroup,
      });
      const { result: attributes } = await session.send(
        "Runtime.callFunctionOn",
        {
          objectId,
          functionDeclaration:
            "function() { const obj = {}; for (const attr of this.attributes) { obj[attr.name] = attr.value }; return obj; }",
          returnByValue: true,
          objectGroup,
        }
      );
      elements.push({
        id: descriptor.name,
        type: descriptor.value.className,
        text: text.value,
        attributes: attributes.value,
      });
    }
  }
  await session.send("Runtime.releaseObjectGroup", { objectGroup });

  return elements;
}

function writeFile(filename, content) {
  fs.writeFileSync(`./workspace/${filename}`, content, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Written", filename);
  });
}

function readFile(filename) {
  fs.readFileSync(`./workspace/${filename}`, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
  });
}

async function recordEvent(log, error) {
  const workspace = fs.readdirSync("./workspace");
  const event = {
    log,
    workspace,
    currentUrl: page.url(),
    clickables: await getClickableElements(),
    error,
    text: await getPageTextContent(),
  };

  eventsCache.push(event);
}

async function init() {
  browser = await puppeteer.launch({
    headless: true,
  });
  page = await browser.newPage();
  await page.goto("https://www.example.com");
}

init();

const app = express();

app.use(express.json());
// Example call
// curl -X POST -H "Content-Type: application/json" -d '{"code": "async function exampleFunction() {await page.goto(`https://www.google.com`); await recordEvent(`Navigated to Google`);}" }' http://localhost:3000/execute

app.post("/execute", async (req, res) => {
  const { code } = req.body;
  try {
    console.log("Executing", code);
    await eval(`(${code})()`);
    await recordEvent("observe");
  } catch (e) {
    console.error(e);
    await recordEvent("observe", e);
  }

  res.json({ events: eventsCache });
  fs.writeFileSync(
    "./workspace/events.json",
    JSON.stringify(eventsCache, null, 2)
  );
  eventsCache = [];
});

app.listen(3000, () => console.log("Server listening on port 3000"));
