import axios from "axios";
import { GoogleGenAI } from "@google/genai";
const hints = {
  hint1: null,
  hint2: null,
};
export const fetchHints = async (problem, apiKey) => {
  console.log(apiKey);
  const message = `You are a coding assistant helping users solve LeetCode problems.
Given the following problem statement, provide only two hints that guide the user toward the solution **without giving away the full answer or code**. The hints should be helpful, slightly leading, and progressively more specific.
Problem Statement:
"""
${problem}
"""
Return format:
Hint 1: <First hint>
Hint 2: <Second hint>`;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
      generationConfig: {
        maxOutputTokens: 750,
        temperature: 0.5, // Use the maxTokens variable from your input
      },
    });
    console.log(response.text);
    return extractHintsFromResponse(response.text);
  } catch (e) {
    console.log(e);
    return hints;
  }
};
function extractHintsFromResponse(responseText) {
  // Regular expressions to extract the hints
  const hint1Match = responseText.match(/Hint\s*1:\s*(.*)/i);
  const hint2Match = responseText.match(/Hint\s*2:\s*(.*)/i);

  if (hint1Match && hint1Match[1]) {
    hints.hint1 = hint1Match[1].trim();
  }

  if (hint2Match && hint2Match[1]) {
    hints.hint2 = hint2Match[1].trim();
  }
  return hints;
}
export const fetchCode = async (problem, userCode, lang, apiKey) => {
  const message = `You are an expert competitive programmer. Here is a LeetCode problem: ${problem}

The user wants to solve it in ${lang}. This is the code the user has written so far: ${userCode}

CRITICAL FORMATTING REQUIREMENTS:
- Return ONLY the source code, nothing else
- NO markdown formatting 
- NO triple backticks (\`\`\`)
- NO explanations before or after the code
- NO "Here's the solution:" or similar text
- NO language identifiers like "java" or "python"
- Start your response directly with the code

Return a complete, working solution in ${lang} that solves the problem correctly:
- Don't include any header files
- Just complete the given class or function
- Add brief inline comments to explain logic where helpful

Your response should start immediately with the code and contain nothing else.`;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
      generationConfig: {
        maxOutputTokens: 750,
        temperature: 0.5, // Use the maxTokens variable from your input
      },
    });
    console.log(response.text);
    return response.text;
  } catch (e) {
    console.log(e);
    return userCode;
  }
};
