/**
 * Verification Script inside server directory
 */

const {
  extractJsonString,
  repairJsonSyntax,
  repairTruncatedJson,
  parseGeminiJson,
  validateAnalysisResponse,
} = require('./services/geminiService');

const {
  validateInterviewQuestionsResponse,
} = require('./services/interviewAiService');

console.log('--- STARTING PARSER VERIFICATION ---');

// Test 1: extractJsonString
const raw1 = 'Explanatory text before\n```json\n{"atsScore": 85}\n```\nExplanatory text after';
const cleaned1 = extractJsonString(raw1);
if (cleaned1 !== '{"atsScore": 85}') {
  throw new Error(`Test 1 Failed: Expected '{"atsScore": 85}', got '${cleaned1}'`);
}
console.log('✅ Test 1 Passed: Markdown code fences and surrounding text stripped.');

// Test 2: Invalid Escapes Repair
const raw2 = '{"atsScore": 90, "summary": "Used C:\\Program Files and \\active directory"}';
const parsed2 = parseGeminiJson(raw2, 'TEST_PARSER_2');
if (parsed2.atsScore !== 90) {
  throw new Error('Test 2 Failed');
}
console.log('✅ Test 2 Passed: Invalid backslash escapes repaired.');

// Test 3: Trailing Commas & Control Characters
const raw3 = '{"atsScore": 75, "strengths": ["Leadership", "Teamwork",],}\u0007';
const parsed3 = parseGeminiJson(raw3, 'TEST_PARSER_3');
if (parsed3.strengths.length !== 2) {
  throw new Error('Test 3 Failed');
}
console.log('✅ Test 3 Passed: Trailing commas and control characters handled.');

// Test 4: Truncated JSON
const raw4 = '{"atsScore": 88, "strengths": ["Item 1", "Item 2"';
const parsed4 = parseGeminiJson(raw4, 'TEST_PARSER_4');
if (parsed4.atsScore !== 88 || parsed4.strengths.length !== 2) {
  throw new Error('Test 4 Failed');
}
console.log('✅ Test 4 Passed: Truncated JSON auto-closed and parsed.');

// Test 5: validateAnalysisResponse robustness
const validated = validateAnalysisResponse({
  atsScore: "95",
  strengths: "Skill 1, Skill 2",
  summary: "Great candidate"
});
if (validated.atsScore !== 95 || validated.strengths.length !== 2) {
  throw new Error('Test 5 Failed');
}
console.log('✅ Test 5 Passed: Response validation and array conversion verified.');

console.log('--- ALL 5 PARSER TESTS PASSED ---');
