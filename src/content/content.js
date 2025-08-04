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
chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  if ((req.type = "GET_PROBLEM")) {
    const statement = getProblem();
    sendResponse({ text: statement || "" });
  }
  return true;
});
