/**
 * Gemini AI Service
 * 
 * Handles interaction with Google Gemini API for structured resume analysis.
 * Reads GEMINI_API_KEY from environment variables and sends structured prompts.
 * Validates, sanitizes, and normalizes AI JSON response against target schema.
 * Includes timeout control, exponential backoff retries, and secure error handling.
 */

const logger = require('../utils/logger');
const { cleanExtractedText } = require('../utils/textCleaner');

/**
 * Clean and extract JSON string from raw Gemini API output.
 * Handles markdown code fences like ```json ... ``` and extracts content between '{' and '}'.
 * 
 * @param {string} rawText 
 * @returns {string} Cleaned JSON string
 */
const extractJsonString = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '{}';

  // 1. Remove UTF-8 BOM, zero-width spaces, and non-breaking spaces
  let cleaned = rawText
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();

  // 2. Extract content inside markdown code blocks ```json ... ``` if present
  const codeBlockMatch = cleaned.match(/```(?:json|JSON)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 3. Extract substring between the first '{' and the last '}'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1) {
    if (lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    } else {
      // Incomplete/truncated JSON ending without closing brace
      cleaned = cleaned.substring(firstBrace);
    }
  }

  return cleaned.trim();
};

/**
 * Repair common LLM JSON syntax anomalies:
 * - Smart/curly double and single quotes
 * - Trailing commas before closing braces/brackets
 * - Illegal ASCII control characters
 * - Invalid escape backslashes
 * 
 * @param {string} jsonStr 
 * @returns {string} Repaired JSON string
 */
const repairJsonSyntax = (jsonStr) => {
  if (!jsonStr || typeof jsonStr !== 'string') return '{}';
  let s = jsonStr;

  // 1. Replace smart/curly quotes with standard quotes
  s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  // 2. Remove trailing commas before closing braces or brackets
  s = s.replace(/,\s*([}\]])/g, '$1');

  // 3. Remove illegal control characters (except \t, \n, \r)
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // 4. Fix invalid escape backslashes (backslashes not followed by valid JSON escape character)
  // Valid JSON escape chars: ", \, /, b, f, n, r, t, uXXXX
  s = s.replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\');

  return s;
};

/**
 * Attempt to repair truncated JSON responses caused by API token limits.
 * Auto-closes unclosed strings, arrays, and objects.
 * 
 * @param {string} jsonStr 
 * @returns {string} Auto-closed repaired JSON string
 */
const repairTruncatedJson = (jsonStr) => {
  if (!jsonStr || typeof jsonStr !== 'string') return '{}';
  let s = jsonStr.trim();

  let inString = false;
  let isEscaped = false;
  const stack = [];

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char);
      } else if (char === '}') {
        if (stack.length > 0 && stack[stack.length - 1] === '{') {
          stack.pop();
        }
      } else if (char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === '[') {
          stack.pop();
        }
      }
    }
  }

  // If ended inside a string, close quote
  if (inString) {
    s += '"';
  }

  // Clean trailing commas or dangling colons at the end of the string
  s = s.replace(/,\s*$/, '');
  s = s.replace(/:\s*$/, ': null');

  // Close remaining open brackets/braces in reverse order
  while (stack.length > 0) {
    const top = stack.pop();
    if (top === '{') {
      s += '}';
    } else if (top === '[') {
      s += ']';
    }
  }

  return s;
};

/**
 * Resilient multi-stage JSON parser for Gemini API outputs.
 * Logs raw responses and applies syntax and truncation repairs if direct parse fails.
 * 
 * @param {string} rawResponseText 
 * @param {string} [contextName='Gemini API']
 * @returns {object} Parsed JavaScript object
 */
const parseGeminiJson = (rawResponseText, contextName = 'Gemini API') => {
  if (!rawResponseText || typeof rawResponseText !== 'string' || rawResponseText.trim().length === 0) {
    logger.error(`[${contextName} ERROR] Received empty or non-string response.`);
    throw new Error('Gemini API returned an empty response.');
  }

  // 1. Log raw Gemini response before parsing
  logger.info(`[${contextName}] Raw Gemini response received (${rawResponseText.length} chars):`, rawResponseText);

  const cleanedStr = extractJsonString(rawResponseText);

  // Stage 1: Direct JSON.parse
  try {
    return JSON.parse(cleanedStr);
  } catch (err1) {
    logger.warn(`[${contextName} WARNING] Direct JSON.parse failed (${err1.message}). Attempting syntax repair...`);
  }

  // Stage 2: Syntax repairs (smart quotes, trailing commas, invalid backslashes, control chars)
  const syntaxRepaired = repairJsonSyntax(cleanedStr);
  try {
    const parsed = JSON.parse(syntaxRepaired);
    logger.info(`[${contextName}] JSON successfully parsed after syntax repair.`);
    return parsed;
  } catch (err2) {
    logger.warn(`[${contextName} WARNING] Syntax repair parse failed (${err2.message}). Attempting truncated JSON repair...`);
  }

  // Stage 3: Truncated JSON repair
  const truncatedRepaired = repairTruncatedJson(syntaxRepaired);
  try {
    const parsed = JSON.parse(truncatedRepaired);
    logger.info(`[${contextName}] JSON successfully parsed after truncated JSON repair.`);
    return parsed;
  } catch (err3) {
    logger.error(`[${contextName} ERROR] All JSON parse attempts failed. Raw Gemini response:`, rawResponseText);
    logger.error(`[${contextName} ERROR] Parse error details:`, err3.message);
    throw new Error(`Gemini API returned an unparseable response structure. Error: ${err3.message}`);
  }
};

/**
 * Validates and normalizes Gemini AI analysis output into strict schema.
 * Supports string-to-array fallback parsing if Gemini outputs comma or newline delimited strings.
 * 
 * @param {object} parsed 
 * @returns {object} Validated analysis object
 */
const validateAnalysisResponse = (parsed) => {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned an invalid empty response structure.');
  }

  // 1. Validate atsScore (number 0 - 100). Default to neutral 50 baseline if invalid/missing.
  let atsScore = 50;
  if (typeof parsed.atsScore === 'number' && !isNaN(parsed.atsScore)) {
    atsScore = Math.min(100, Math.max(0, Math.round(parsed.atsScore)));
  } else if (typeof parsed.atsScore === 'string' && !isNaN(Number(parsed.atsScore))) {
    atsScore = Math.min(100, Math.max(0, Math.round(Number(parsed.atsScore))));
  }

  // Robust helper to ensure array of non-empty strings (supports string-to-array conversion)
  const sanitizeArray = (arr, defaultItem) => {
    if (Array.isArray(arr)) {
      const filtered = arr.map((item) => String(item).replace(/^[-*•\d.\s]+/, '').trim()).filter(Boolean);
      if (filtered.length > 0) return filtered;
    } else if (typeof arr === 'string' && arr.trim().length > 0) {
      // Split comma-separated or line-separated string outputs into array items
      const splitItems = arr
        .split(/[\n,;]+/)
        .map((item) => item.replace(/^[-*•\d.\s]+/, '').trim())
        .filter(Boolean);
      if (splitItems.length > 0) return splitItems;
    }
    return defaultItem ? [defaultItem] : [];
  };

  // Helper to ensure non-empty string
  const sanitizeString = (str, defaultVal) => {
    if (typeof str === 'string' && str.trim().length > 0) {
      return str.trim();
    }
    return defaultVal || '';
  };

  const strengths = sanitizeArray(
    parsed.strengths,
    'Demonstrates relevant experience and core domain technical skills.'
  );

  const weaknesses = sanitizeArray(
    parsed.weaknesses,
    'Could quantify more key bullet achievements with measurable metric outcomes.'
  );

  const missingSkills = sanitizeArray(
    parsed.missingSkills,
    'Specific industry-standard technical tools or specialized keywords.'
  );

  const roleMatch = sanitizeArray(
    parsed.roleMatch,
    'Overall alignment with position competencies and background expectations.'
  );

  const improvements = sanitizeArray(
    parsed.improvements,
    'Incorporate clear action verbs and numerical metrics to highlight project impact.'
  );

  const summary = sanitizeString(
    parsed.summary,
    'Comprehensive resume evaluation completed. Candidate presents solid baseline qualifications for target roles with opportunities for impact bullet optimization.'
  );

  return {
    atsScore,
    strengths,
    weaknesses,
    missingSkills,
    roleMatch,
    improvements,
    summary,
    analyzedAt: new Date(),
  };
};

/**
 * Check whether an error response indicates an invalid or missing API key
 * 
 * @param {string} errMsg 
 * @param {number} [statusCode] 
 * @returns {boolean}
 */
const isApiKeyError = (errMsg, statusCode) => {
  if (statusCode === 401 || statusCode === 403) return true;
  if (!errMsg || typeof errMsg !== 'string') return false;
  const lower = errMsg.toLowerCase();
  return (
    lower.includes('api key') ||
    lower.includes('api_key_invalid') ||
    lower.includes('apikey') ||
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('invalid key')
  );
};

/**
 * Helper to perform HTTP POST fetch with AbortController timeout and exponential backoff retry
 * 
 * @param {string} endpoint - Gemini API endpoint URL
 * @param {object} payload - JSON request payload
 * @param {number} [maxRetries=1] - Max retry attempts for transient errors
 * @param {number} [timeoutMs=30000] - Request timeout in milliseconds
 * @returns {Promise<Response>} Fetch Response object
 */
const fetchWithTimeoutAndRetry = async (endpoint, payload, maxRetries = 1, timeoutMs = 30000) => {
  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Retry on transient server errors (429 Rate Limit, 500, 502, 503, 504)
      if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
        attempt++;
        const backoffMs = Math.pow(2, attempt) * 1000;
        logger.warn(`[GEMINI SERVICE WARNING] Transient HTTP ${response.status}. Retrying attempt ${attempt}/${maxRetries} after ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err.name === 'AbortError') {
        lastError = new Error(`Gemini API request timed out after ${timeoutMs / 1000} seconds.`);
      }

      if (attempt < maxRetries) {
        attempt++;
        const backoffMs = Math.pow(2, attempt) * 1000;
        logger.warn(`[GEMINI SERVICE WARNING] Network fetch failed (${err.message}). Retrying attempt ${attempt}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error('Request failed after retry attempts.');
};

/**
 * Shared helper to call Google Gemini API using @google/generative-ai SDK
 * with automatic fallback to native fetch if needed.
 * Includes timeout control, exponential backoff retries, and immediate fail-fast on API key errors.
 * 
 * Supported models in order of preference:
 * 1. gemini-1.5-flash (Fast, efficient, default stable model)
 * 2. gemini-1.5-pro (High intelligence fallback model)
 * 3. gemini-2.0-flash (Latest flash model fallback)
 * 
 * @param {string} systemContext - System prompt / instructions
 * @param {string} userContent - User content prompt
 * @param {object} [generationConfigOverride] - Custom generation parameters
 * @returns {Promise<string>} Raw text output from Gemini API
 */
const callGeminiApi = async (systemContext, userContent, generationConfigOverride = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    throw new Error(
      'Gemini API key is missing or not configured. Please set GEMINI_API_KEY in server environment variables.'
    );
  }

  const promptText = `${systemContext}\n\n${userContent}`;
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
  let lastError = null;

  // 1. Try using @google/generative-ai SDK if installed
  let GoogleGenerativeAI;
  try {
    const sdk = require('@google/generative-ai');
    GoogleGenerativeAI = sdk.GoogleGenerativeAI;
  } catch (sdkImportErr) {
    // SDK not installed or failed to load, will use REST fetch fallback
  }

  if (GoogleGenerativeAI) {
    const genAI = new GoogleGenerativeAI(apiKey.trim());

    // Helper to execute SDK model call with 30s timeout
    const generateWithSdkTimeout = async (model, prompt, timeoutMs = 30000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const promise = model.generateContent(prompt);
        const timeoutPromise = new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error(`Gemini API SDK request timed out after ${timeoutMs / 1000} seconds.`));
          });
        });

        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId);
        return result;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    };

    for (const modelName of models) {
      let attempt = 0;
      const maxRetries = 1;

      while (attempt <= maxRetries) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
              maxOutputTokens: 4096,
              ...generationConfigOverride,
            },
          });

          const result = await generateWithSdkTimeout(model, promptText, 30000);
          const response = await result.response;
          const text = response.text();

          if (text && text.trim().length > 0) {
            return text;
          }
        } catch (err) {
          const errMsg = err.message || String(err);

          // Fail-fast on invalid API key errors without trying other models
          if (isApiKeyError(errMsg)) {
            logger.error(`[GEMINI SERVICE ERROR] Invalid API key detected on SDK model ${modelName}: ${errMsg}`);
            throw new Error('Invalid or unauthorized Gemini API key provided.');
          }

          if (attempt < maxRetries && !errMsg.includes('timed out')) {
            attempt++;
            const backoffMs = Math.pow(2, attempt) * 1000;
            logger.warn(`[GEMINI SERVICE WARNING] SDK call to model '${modelName}' failed (${errMsg}). Retrying attempt ${attempt}/${maxRetries} after ${backoffMs}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          }

          logger.warn(`[GEMINI SERVICE WARNING] SDK call to model '${modelName}' failed: ${errMsg}`);
          lastError = new Error(`Gemini API Error (${modelName}): ${errMsg}`);
          break;
        }
      }
    }
  }

  // 2. Fallback to HTTP REST fetch if SDK is not present or SDK attempts failed
  const requestPayload = {
    contents: [
      {
        parts: [
          {
            text: promptText,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 4096,
      ...generationConfigOverride,
    },
  };

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const response = await fetchWithTimeoutAndRetry(endpoint, requestPayload, 1, 30000);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiErrMsg = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;

        // Fail-fast on invalid API key errors without trying other models
        if (isApiKeyError(apiErrMsg, response.status)) {
          logger.error(`[GEMINI SERVICE ERROR] Invalid API key returned by REST API model ${model}: ${apiErrMsg}`);
          throw new Error('Invalid or unauthorized Gemini API key provided.');
        }

        logger.warn(`[GEMINI SERVICE WARNING] REST call to model ${model} returned non-OK status (${response.status}): ${apiErrMsg}. Trying next model...`);
        lastError = new Error(`Gemini API Error (${model}): ${apiErrMsg}`);
        continue;
      }

      const responseData = await response.json();
      const candidatePart = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidatePart) {
        lastError = new Error(`Gemini model ${model} returned response with no text content.`);
        continue;
      }

      return candidatePart;
    } catch (err) {
      if (err.message && err.message.includes('Invalid or unauthorized Gemini API key')) {
        throw err;
      }
      lastError = err;
    }
  }

  logger.error('[GEMINI SERVICE ERROR] All model attempts failed:', lastError ? lastError.message : 'Unknown error');
  throw lastError || new Error('Failed to obtain response from Gemini API. Please check network connection and API key.');
};

/**
 * Analyzes resume text using Google Gemini API.
 * Includes text preprocessing, structured schema enforcement, and parse error retries.
 * 
 * @param {string} extractedText - Extracted text content from resume PDF/DOCX
 * @param {string} [jobTitle] - Optional target job title
 * @param {string} [jobDescription] - Optional target job description
 * @returns {Promise<object>} Validated analysis object matching required JSON schema
 */
const analyzeResume = async (extractedText, jobTitle = '', jobDescription = '') => {
  if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
    throw new Error(
      'Resume content is empty or could not be extracted. Unable to perform AI analysis.'
    );
  }

  // Preprocess and clean extracted text to remove zero-width characters and normalize line breaks
  const sanitizedResumeText = cleanExtractedText(extractedText);

  // Construct structured prompt with clear evaluation criteria & rubric
  const systemContext = `You are a Senior ATS (Applicant Tracking System) Expert and Executive Technical Recruiter with 15+ years of experience.
Evaluate the candidate's resume text against the target job role and job description.
Perform a thorough, objective, and realistic audit.

EVALUATION CRITERIA:
- atsScore: Calculate a realistic integer 0-100 score based on keyword match density, hard/soft skill relevance, structural formatting readability, and quantifiable business impact metrics (85-100: Exceptional, 70-84: Good, 50-69: Moderate gaps, 0-49: Poor).
- strengths: List key strong qualifications, relevant achievements, and demonstrated expertise.
- weaknesses: Identify missing elements, unquantified bullets, formatting risks, or weak phrasing.
- missingSkills: List specific missing hard skills, technical tools, frameworks, or domain keywords relevant for the target role.
- roleMatch: Detail how closely the candidate's background matches the specific requirements of the target job role.
- improvements: Provide concrete, highly actionable recommendations to rewrite bullets or add metrics to increase match rate.
- summary: Provide a 2-3 sentence executive summary assessment of the candidate's overall profile readiness.

CRITICAL INSTRUCTIONS:
1. You MUST respond ONLY with a valid, strictly formatted JSON object.
2. Do NOT include any markdown wrapper, commentary, or text outside the JSON object.
3. Ensure string values use double backslashes (\\\\) for any Windows paths or special characters, and do NOT include raw unescaped line breaks inside string values.

REQUIRED JSON SCHEMA:
{
  "atsScore": number (integer between 0 and 100),
  "strengths": [array of strings],
  "weaknesses": [array of strings],
  "missingSkills": [array of strings],
  "roleMatch": [array of strings],
  "improvements": [array of strings],
  "summary": string
}`;

  const userContent = `RESUME CONTENT:
---
${sanitizedResumeText.substring(0, 12000)}
---

${jobTitle ? `TARGET JOB TITLE: ${jobTitle}\n` : ''}${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription.substring(0, 4000)}\n` : ''}

Analyze the resume and return STRICT JSON according to the specified schema.`;

  // Perform AI analysis call with auto-retry on unparseable JSON output
  const maxAttempts = 2;
  let lastParseErr = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const rawResponseText = await callGeminiApi(systemContext, userContent, { temperature: 0.2 });
      const parsedData = parseGeminiJson(rawResponseText, `RESUME ANALYSIS (Attempt ${attempt})`);
      return validateAnalysisResponse(parsedData);
    } catch (parseErr) {
      lastParseErr = parseErr;
      if (parseErr.message && parseErr.message.includes('Invalid or unauthorized Gemini API key')) {
        throw parseErr;
      }
      logger.warn(`[GEMINI SERVICE WARNING] Resume analysis JSON parse attempt ${attempt}/${maxAttempts} failed: ${parseErr.message}`);
      if (attempt < maxAttempts) {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  logger.error('[GEMINI SERVICE ERROR] All resume analysis parsing attempts failed:', lastParseErr?.message);
  throw new Error(`Gemini API returned an unparseable response structure. Error: ${lastParseErr?.message}`);
};

module.exports = {
  analyzeResume,
  validateAnalysisResponse,
  extractJsonString,
  repairJsonSyntax,
  repairTruncatedJson,
  parseGeminiJson,
  fetchWithTimeoutAndRetry,
  callGeminiApi,
  isApiKeyError,
};
