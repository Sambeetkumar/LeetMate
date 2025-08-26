function getProblem() {
  const metDescEl = document.querySelector("meta[name=description]");
  const problemStateMent = metDescEl?.getAttribute("content");
  return removeBlankLines(problemStateMent);
}
function removeBlankLines(str) {
  return str
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .join("\n");
}
function getUserCode() {
  //extract users code
  const userCurrentCodeContainer = document.querySelectorAll(".view-line");
  const extractedCode = extractCode(userCurrentCodeContainer);
  //get the programming language
  const langButton = document.querySelector(
    "button.rounded.items-center.whitespace-nowrap.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.group"
  );
  let lang = "C++";
  if (langButton?.textContent) {
    lang = langButton.textContent;
  }
  return { extractedCode, lang };
}
export function extractCode(htmlContent) {
  // Extract the text content of each line with the 'view-line' class
  const code = Array.from(htmlContent)
    .map((line) => line.textContent || "") // Ensure textContent is not null
    .join("\n");

  return code;
}
chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if (req.type === "GET_PROBLEM") {
    const statement = getProblem();
    sendResponse({ text: statement || "" });
    return true;
  }
  if (req.type === "GET_USER_CODE") {
    const userObj = getUserCode();
    console.log(userObj);
    sendResponse({ userObj });
    return true;
  }
});
