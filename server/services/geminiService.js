/**
 * Gemini AI Service
 * 
 * Handles interaction with Google Gemini API for structured resume analysis.
 * Reads GEMINI_API_KEY from environment variables and sends structured prompts.
 * Validates, sanitizes, and normalizes AI JSON response against target schema.
 * Includes timeout control, exponential backoff retries, and secure error handling.
 */

/**
 * Clean and extract JSON string from raw Gemini API output.
 * Handles markdown code fences like ```json ... ``` and extracts content between '{' and '}'.
 * 
 * @param {string} rawText 
 * @returns {string} Cleaned JSON string
 */
const extractJsonString = (rawText) => {
  if (!rawText) return '{}';
  let cleaned = rawText.trim();

  // 1. Extract content inside markdown code blocks ```json ... ``` if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 2. Extract substring between the first '{' and the last '}'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
};

/**
 * Validates and normalizes Gemini AI analysis output into strict schema.
 * 
 * @param {object} parsed 
 * @returns {object} Validated analysis object
 */
const validateAnalysisResponse = (parsed) => {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned an invalid empty response structure.');
  }

  // 1. Validate atsScore (number 0 - 100)
  let atsScore = 70;
  if (typeof parsed.atsScore === 'number' && !isNaN(parsed.atsScore)) {
    atsScore = Math.min(100, Math.max(0, Math.round(parsed.atsScore)));
  } else if (typeof parsed.atsScore === 'string' && !isNaN(Number(parsed.atsScore))) {
    atsScore = Math.min(100, Math.max(0, Math.round(Number(parsed.atsScore))));
  }

  // Helper to ensure array of non-empty strings
  const sanitizeArray = (arr, defaultItem) => {
    if (Array.isArray(arr)) {
      const filtered = arr.map((item) => String(item).trim()).filter(Boolean);
      if (filtered.length > 0) return filtered;
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
        console.warn(`[GEMINI SERVICE WARNING] Transient HTTP ${response.status}. Retrying attempt ${attempt}/${maxRetries} after ${backoffMs}ms...`);
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
        console.warn(`[GEMINI SERVICE WARNING] Network fetch failed (${err.message}). Retrying attempt ${attempt}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error('Request failed after retry attempts.');
};

/**
 * Analyzes resume text using Google Gemini API
 * 
 * @param {string} extractedText - Extracted text content from resume PDF/DOCX
 * @param {string} [jobTitle] - Optional target job title
 * @param {string} [jobDescription] - Optional target job description
 * @returns {Promise<object>} Validated analysis object matching required JSON schema
 */
const analyzeResume = async (extractedText, jobTitle = '', jobDescription = '') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    throw new Error(
      'Gemini API key is missing or not configured. Please set GEMINI_API_KEY in server environment variables.'
    );
  }

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error(
      'Resume content is empty or could not be extracted. Unable to perform AI analysis.'
    );
  }

  // Construct structured prompt with clear evaluation criteria
  const systemContext = `You are a Senior ATS (Applicant Tracking System) Expert and Executive Technical Recruiter with 15+ years of experience.
Evaluate the candidate's resume text against the target job role and job description.
Perform a thorough, objective, and realistic audit.

EVALUATION CRITERIA:
- atsScore: Calculate a realistic 0-100 score based on keyword match density, hard/soft skill relevance, structural formatting readability, and quantifiable business impact metrics.
- strengths: List key strong qualifications, relevant achievements, and demonstrated expertise.
- weaknesses: Identify missing elements, unquantified bullets, formatting risks, or weak phrasing.
- missingSkills: List specific missing hard skills, technical tools, frameworks, or domain keywords relevant for the target role.
- roleMatch: Detail how closely the candidate's background matches the specific requirements of the target job role.
- improvements: Provide concrete, highly actionable recommendations to rewrite bullets or add metrics to increase match rate.
- summary: Provide a 2-3 sentence executive summary assessment of the candidate's overall profile readiness.

CRITICAL INSTRUCTIONS:
1. You MUST respond ONLY with a valid, strictly formatted JSON object.
2. Do NOT include any markdown wrapper, commentary, or text outside the JSON object.

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
${extractedText.substring(0, 12000)}
---

${jobTitle ? `TARGET JOB TITLE: ${jobTitle}\n` : ''}${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription.substring(0, 4000)}\n` : ''}

Analyze the resume and return STRICT JSON according to the specified schema.`;

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
      temperature: 0.2,
    },
  };

  // Supported Gemini API endpoint models in order of preference
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
        
        // Handle API key authorization errors
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          if (apiErrMsg.toLowerCase().includes('api key')) {
            throw new Error(`Invalid or unauthorized Gemini API key provided.`);
          }
        }
        
        console.warn(`[GEMINI SERVICE WARNING] Model ${model} returned non-OK status: ${apiErrMsg}. Trying next model...`);
        lastError = new Error(`Gemini API Error (${model}): ${apiErrMsg}`);
        continue;
      }

      const responseData = await response.json();
      const candidatePart = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidatePart) {
        lastError = new Error(`Gemini model ${model} returned response with no text content.`);
        continue;
      }

      rawResponseText = candidatePart;
      break; // Success! Break out of model loop
    } catch (err) {
      if (err.message && err.message.includes('Invalid or unauthorized Gemini API key')) {
        throw err; // Stop model retries if key is invalid
      }
      lastError = err;
    }
  }

  if (!rawResponseText) {
    console.error('[GEMINI SERVICE ERROR] All model attempts failed:', lastError?.message || lastError);
    throw lastError || new Error('Failed to obtain analysis response from Gemini API.');
  }

  // Parse and validate AI output
  try {
    const cleanedJsonStr = extractJsonString(rawResponseText);
    const parsedData = JSON.parse(cleanedJsonStr);
    return validateAnalysisResponse(parsedData);
  } catch (parseErr) {
    console.error('[GEMINI SERVICE ERROR] Failed to parse JSON response:', parseErr.message);
    throw new Error('Gemini API returned an unparseable response structure. Please try again.');
  }
};

module.exports = {
  analyzeResume,
  validateAnalysisResponse,
  extractJsonString,
};
