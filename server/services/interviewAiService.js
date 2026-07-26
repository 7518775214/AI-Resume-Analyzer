/**
 * Interview AI Service
 * 
 * Handles interaction with Google Gemini API to generate tailored interview questions.
 * Evaluates parsed resume text, AI resume analysis, and target job role.
 * Enforces strict JSON output schema and validates response structure.
 * Includes retries, timeout handling, and graceful error handling.
 */

const { extractJsonString, fetchWithTimeoutAndRetry } = require('./geminiService');

/**
 * Validates and normalizes Gemini AI response into required interview questions schema.
 * 
 * @param {object} parsed 
 * @returns {object} Validated interview questions object
 */
const validateInterviewQuestionsResponse = (parsed) => {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned an invalid response structure.');
  }

  // Helper to ensure array of non-empty strings
  const sanitizeStringArray = (arr, defaultArray) => {
    if (Array.isArray(arr)) {
      const filtered = arr.map((item) => String(item).trim()).filter(Boolean);
      if (filtered.length > 0) return filtered;
    }
    return defaultArray || [];
  };

  const technical = parsed.technical && typeof parsed.technical === 'object' ? parsed.technical : {};

  const easyTechnical = sanitizeStringArray(technical.easy, [
    'Explain the fundamental architecture and core principles relevant to your target role.',
    'What are the key differences between synchronous and asynchronous operations in modern software systems?',
  ]);

  const mediumTechnical = sanitizeStringArray(technical.medium, [
    'How do you design and optimize database queries and caching layers for high throughput applications?',
    'Describe how you approach error handling, logging, and state management in complex web applications.',
  ]);

  const hardTechnical = sanitizeStringArray(technical.hard, [
    'Walk through how you would architect a scalable, fault-tolerant microservice system handling high concurrent traffic.',
    'Explain how you diagnose and resolve complex memory leaks or performance bottlenecks under heavy load.',
  ]);

  const hr = sanitizeStringArray(parsed.hr, [
    'Tell me about a challenging project deadline you faced and how you prioritized tasks to deliver successfully.',
    'Describe a situation where you had a technical disagreement with a team member and how you resolved it.',
    'What is your approach to receiving constructive feedback and staying current with rapid technology changes?',
  ]);

  const projectBased = sanitizeStringArray(parsed.projectBased, [
    'Describe the technical architecture of your most impactful recent project and your specific engineering contributions.',
    'What key architectural trade-offs or technical debt decisions did you navigate during your past project implementations?',
    'How did you measure and validate the performance or business impact of the features you delivered?',
  ]);

  const tips = sanitizeStringArray(parsed.tips, [
    'Use the STAR method (Situation, Task, Action, Result) when answering behavioral and project-based questions.',
    'Quantify your impact with measurable metrics (e.g., improved response time by 40%, reduced latency).',
    'Review core domain fundamentals and be ready to discuss trade-offs in your technical architecture choices.',
  ]);

  return {
    technical: {
      easy: easyTechnical,
      medium: mediumTechnical,
      hard: hardTechnical,
    },
    hr,
    projectBased,
    tips,
    generatedAt: new Date(),
  };
};

/**
 * Generates tailored interview questions using Google Gemini API based on candidate profile.
 * 
 * @param {string} extractedText - Extracted text content from candidate resume
 * @param {object} [aiAnalysis] - Optional Gemini AI resume analysis object
 * @param {string} [targetRole] - Optional target job role
 * @returns {Promise<object>} Validated interview questions object matching required JSON schema
 */
const generateInterviewQuestions = async (extractedText, aiAnalysis = null, targetRole = '') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    throw new Error(
      'Gemini API key is missing or not configured. Please set GEMINI_API_KEY in server environment variables.'
    );
  }

  if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
    throw new Error(
      'Resume content is empty or missing. Unable to generate interview questions.'
    );
  }

  // Extract key details from AI Resume Analysis context if available
  const strengths = aiAnalysis?.strengths ? aiAnalysis.strengths.slice(0, 4).join('; ') : 'General software engineering competencies';
  const weaknesses = aiAnalysis?.weaknesses ? aiAnalysis.weaknesses.slice(0, 4).join('; ') : 'Formatting or metric density improvements';
  const missingSkills = aiAnalysis?.missingSkills ? aiAnalysis.missingSkills.slice(0, 5).join(', ') : 'Domain specific toolings';

  const systemContext = `You are a Senior Technical Lead and Hiring Manager with 15+ years of experience interviewing candidate engineers.
Your goal is to generate a comprehensive, highly targeted set of interview questions and preparation tips for a candidate based on their parsed resume text, AI resume analysis, and target job role.

CRITICAL REQUIREMENTS:
1. You MUST respond ONLY with a valid, strictly formatted JSON object.
2. Do NOT include any markdown code blocks or text outside the JSON response.
3. Every question must be tailored specifically to the candidate's actual background, listed projects, skills, gaps, and target role.

REQUIRED JSON SCHEMA:
{
  "technical": {
    "easy": [array of 2-3 string questions testing core concepts and fundamentals],
    "medium": [array of 2-3 string questions testing system design, optimization, and scenario problem-solving],
    "hard": [array of 2-3 string questions testing advanced edge cases, high scalability, or deep technical architecture]
  },
  "hr": [array of 3-4 string behavioral/situational questions focusing on teamwork, communication, and STAR method],
  "projectBased": [array of 3-4 string questions probing candidate's specific past project contributions, tech stack choices, and outcomes],
  "tips": [array of 3-4 string actionable preparation tips addressing candidate's specific skill gaps and weaknesses]
}`;

  const userContent = `CANDIDATE TARGET ROLE: ${targetRole || 'Software Engineer / Technology Specialist'}

CANDIDATE RESUME SUMMARY & ANALYSIS:
- Identified Strengths: ${strengths}
- Identified Areas for Improvement: ${weaknesses}
- Missing Target Keywords/Skills: ${missingSkills}

CANDIDATE RESUME EXTRACTED CONTENT:
---
${extractedText.substring(0, 10000)}
---

Generate tailored interview questions and preparation tips in STRICT JSON matching the specified schema.`;

  const requestPayload = {
    contents: [
      {
        parts: [
          {
            text: `${systemContext}\n\n${userContent}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  };

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
  let lastError = null;
  let rawResponseText = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const response = await fetchWithTimeoutAndRetry(endpoint, requestPayload, 1, 30000);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiErrMsg = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;

        if (response.status === 400 || response.status === 401 || response.status === 403) {
          if (apiErrMsg.toLowerCase().includes('api key')) {
            throw new Error('Invalid or unauthorized Gemini API key provided.');
          }
        }

        console.warn(`[INTERVIEW AI SERVICE WARNING] Model ${model} returned non-OK status: ${apiErrMsg}. Trying next model...`);
        lastError = new Error(`Gemini API Error (${model}): ${apiErrMsg}`);
        continue;
      }

      const responseData = await response.json();
      const candidatePart = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidatePart) {
        lastError = new Error(`Gemini model ${model} returned empty response.`);
        continue;
      }

      rawResponseText = candidatePart;
      break;
    } catch (err) {
      if (err.message && err.message.includes('Invalid or unauthorized Gemini API key')) {
        throw err;
      }
      lastError = err;
    }
  }

  if (!rawResponseText) {
    console.error('[INTERVIEW AI SERVICE ERROR] All model attempts failed:', lastError?.message || lastError);
    throw lastError || new Error('Failed to generate interview questions from Gemini API.');
  }

  try {
    const cleanedJsonStr = extractJsonString(rawResponseText);
    const parsedData = JSON.parse(cleanedJsonStr);
    return validateInterviewQuestionsResponse(parsedData);
  } catch (parseErr) {
    console.error('[INTERVIEW AI SERVICE ERROR] JSON parse failure:', parseErr.message);
    throw new Error('Gemini API returned an unparseable response. Please try again.');
  }
};

module.exports = {
  generateInterviewQuestions,
  validateInterviewQuestionsResponse,
};
