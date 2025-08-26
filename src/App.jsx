import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { fetchHints, fetchCode } from "./utils/api";
function App() {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState(null);
  const [onPage, setOnPage] = useState(false);
  const [hints, setHints] = useState({
    hint1: "loading...",
    hint2: "loading...",
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  useEffect(() => {
    const fetchApiKey = async () => {
      const result = await chrome.storage.sync.get("apiKey");
      setApiKey(result.apiKey);
      setLoading(false);
    };
    fetchApiKey();
    fetchProblem();
  }, []);
  useEffect(() => {
    const getHints = async () => {
      if (apiKey && problem) {
        try {
          const res = await fetchHints(problem, apiKey);
          setHints(res);
        } catch (err) {
          console.error("Failed to fetch hints:", err);
          setHints({
            hint1: "Error fetching hint 1",
            hint2: "Error fetching hint 2",
          });
        }
      }
    };

    getHints();
  }, [apiKey, problem]);
  //function to fetch problem from content.js
  const fetchProblem = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab.url.includes("leetcode.com/problems")) {
        console.log("Not a LeetCode tab");
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: "GET_PROBLEM" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Message failed:", chrome.runtime.lastError.message);
          return;
        }

        if (!response || !response.text) {
          console.log("No response or 'text' undefined from content.js");
          return;
        }

        if (response.text.trim() !== "") {
          setProblem(response.text);
          setOnPage(true);
        }
      });
    });
  };
  //function to fetch user code from content.js
  const fetchUserCode = () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab.url.includes("leetcode.com/problems")) {
        console.log("Not a LeetCode tab");
        reject(new Error("Not a LeetCode tab"));
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: "GET_USER_CODE" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Message failed:", chrome.runtime.lastError.message);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response || !response.userObj) {
          console.log("No response");
          reject(new Error("No response"));
          return;
        }
        console.log(response.userObj);
        
        // Resolve with the actual values
        resolve({
          lang: response.userObj.lang,
          userCode: response.userObj.extractedCode
        });
      });
    });
  });
};
  //funtion to send req to content for injecting ai genearted source code
  const handleGetCode = async () => {
  try {
    setIsFetching(true);
    setIsCopied(false);
    
    const { lang: currentLang, userCode: currentUserCode } = await fetchUserCode();
    const aiCode = await fetchCode(problem, currentUserCode, currentLang, apiKey);
    console.log(aiCode);
    
    await navigator.clipboard.writeText(aiCode);
    console.log("copied to clipboard");
    
    // Keep both true briefly, then transition
    setIsCopied(true);
    // Don't set isFetching to false immediately
    
    setTimeout(() => {
      setIsCopied(false);
      setIsFetching(false); // Reset both after 2s
    }, 2000);
    
  } catch (err) {
    console.log(err);
    setIsFetching(false);
    setIsCopied(false);
  }
};
  //function to save api key
  const handleSaveApiKey = async () => {
    const inputElement = document.getElementById("apiKeyInput"); // Access directly or use useRef
    const newKey = inputElement.value.trim();
    if (newKey) {
      await chrome.storage.sync.set({ apiKey: newKey });
      setMessage("API Key saved successfully! Reloading...");
      setTimeout(() => {
        setApiKey(newKey); // Trigger re-render to show main content
        setMessage("");
      }, 1000);
    } else {
      setMessage("Please enter a valid API Key.");
    }
  };
  //function to clear API KEY
  const handleClearApiKey = async () => {
    await chrome.storage.sync.remove("apiKey");
    setApiKey(null); // Trigger re-render to show input form
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 h-auto w-[350px] font-sans text-gray-800 bg-gray-50">
      {!onPage ? (
        <p className="text-lg">Please be on leetcode problems page.</p>
      ) : apiKey ? (
        <div>
          <h1 className="text-xl font-bold text-blue-600 mb-3">LeetMate</h1>
          <p className="text-sm mb-4">Welcome! Your API key is set.</p>
          <div className="flex flex-col space-y-4 justify-around">
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                <Typography component="span">Hint 1</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{hints.hint1}</Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
              >
                <Typography component="span">Hint 2</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{hints.hint2}</Typography>
              </AccordionDetails>
            </Accordion>
            <button
              onClick={handleGetCode}
              className="text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              {isFetching && isCopied
                ? "Copied ✅"
                : isFetching
                ? "Fetching 🕙"
                : "Get code 💯"}
            </button>
            <button
              onClick={handleClearApiKey}
              className="text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Clear API Key 🔑
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 w-[350px] font-sans text-gray-800 bg-gray-50">
          <h1 className="text-xl font-bold text-blue-600 mb-3">LeetMate</h1>
          <h2 className="text-lg font-bold text-blue-600 mb-3">
            Setup Your API Key
          </h2>
          <p className="text-sm mb-4">
            Please enter your Gemini API Key to use the extension.
          </p>
          <input
            type="text"
            id="apiKeyInput"
            placeholder="Enter API Key"
            className="w-[90%] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
          />
          <button
            onClick={handleSaveApiKey}
            className="w-[90%] text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Save API Key
          </button>
          {message && (
            <div
              className={`mt-2 text-sm ${
                message.includes("saved") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
