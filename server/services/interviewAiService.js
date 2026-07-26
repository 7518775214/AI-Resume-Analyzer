/**
 * Interview AI Service
 * 
 * Handles interaction with Google Gemini API to generate tailored interview questions.
 * Evaluates parsed resume text, AI resume analysis, and target job role.
 * Enforces strict JSON output schema and validates response structure.
 * Includes retries, timeout handling, and graceful error handling.
 */

const logger = require('../utils/logger');
const { cleanExtractedText } = require('../utils/textCleaner');
const { extractJsonString, callGeminiApi } = require('./geminiService');

/**
 * Validates and normalizes Gemini AI response into required interview questions schema.
 * Supports string-to-array fallback parsing and deduplication.
 * 
 * @param {object} parsed 
 * @returns {object} Validated interview questions object
 */
const validateInterviewQuestionsResponse = (parsed) => {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned an invalid response structure.');
  }

  // Helper to sanitize, clean bullet points/numbers, convert strings to arrays, and deduplicate questions
  const sanitizeStringArray = (arr, defaultArray) => {
    let items = [];

    if (Array.isArray(arr)) {
      items = arr;
    } else if (typeof arr === 'string' && arr.trim().length > 0) {
      // Handle fallback if Gemini returns a newline or delimited string instead of array
      items = arr.split(/[\n,;]+/);
    }

    const seen = new Set();
    const filtered = [];

    for (const item of items) {
      if (item === null || item === undefined) continue;
      // Strip leading numbers (1. ), bullets (- , * , • ), and whitespace
      const cleaned = String(item)
        .replace(/^[-*•\d.\s]+/, '')
        .trim();

      if (cleaned.length > 0) {
        const lower = cleaned.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          filtered.push(cleaned);
        }
      }
    }

    if (filtered.length > 0) {
      return filtered;
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
 * Includes text preprocessing, structured schema enforcement, and parse error retries.
 * 
 * @param {string} extractedText - Extracted text content from candidate resume
 * @param {object} [aiAnalysis] - Optional Gemini AI resume analysis object
 * @param {string} [targetRole] - Optional target job role
 * @returns {Promise<object>} Validated interview questions object matching required JSON schema
 */
const generateInterviewQuestions = async (extractedText, aiAnalysis = null, targetRole = '') => {
  if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
    throw new Error(
      'Resume content is empty or missing. Unable to generate interview questions.'
    );
  }

  // Preprocess and clean extracted text to eliminate control characters and zero-width spaces
  const sanitizedResumeText = cleanExtractedText(extractedText);

  // Extract key details from AI Resume Analysis context if available, checking array lengths
  const strengths = Array.isArray(aiAnalysis?.strengths) && aiAnalysis.strengths.length > 0
    ? aiAnalysis.strengths.slice(0, 4).join('; ')
    : 'General software engineering competencies';

  const weaknesses = Array.isArray(aiAnalysis?.weaknesses) && aiAnalysis.weaknesses.length > 0
    ? aiAnalysis.weaknesses.slice(0, 4).join('; ')
    : 'Formatting or metric density improvements';

  const missingSkills = Array.isArray(aiAnalysis?.missingSkills) && aiAnalysis.missingSkills.length > 0
    ? aiAnalysis.missingSkills.slice(0, 5).join(', ')
    : 'Domain specific toolings';

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
${sanitizedResumeText.substring(0, 10000)}
---

Generate tailored interview questions and preparation tips in STRICT JSON matching the specified schema.`;

  const maxAttempts = 2;
  let lastParseErr = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const rawResponseText = await callGeminiApi(systemContext, userContent, { temperature: 0.3 });
      const cleanedJsonStr = extractJsonString(rawResponseText);
      const parsedData = JSON.parse(cleanedJsonStr);
      return validateInterviewQuestionsResponse(parsedData);
    } catch (parseErr) {
      lastParseErr = parseErr;
      if (parseErr.message && parseErr.message.includes('Invalid or unauthorized Gemini API key')) {
        throw parseErr;
      }
      logger.warn(`[INTERVIEW AI SERVICE WARNING] JSON parse attempt ${attempt}/${maxAttempts} failed: ${parseErr.message}`);
      if (attempt < maxAttempts) {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  logger.error('[INTERVIEW AI SERVICE ERROR] All interview questions parsing attempts failed:', lastParseErr?.message);
  throw new Error('Gemini API returned an unparseable response. Please try again.');
};

module.exports = {
  generateInterviewQuestions,
  validateInterviewQuestionsResponse,
};


