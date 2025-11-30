/*
 * Main JavaScript for Resume Fit Analyzer
 * Handles reading files, parsing text, computing match scores,
 * rendering results, and simulating a paid cover letter generation.
 */

// DOM elements
const resumeInput = document.getElementById('resumeInput');
const jobDescriptionInput = document.getElementById('jobDescription');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('results-section');
const matchScoreEl = document.getElementById('matchScore');
const matchingKeywordsEl = document.getElementById('matchingKeywords');
const missingKeywordsEl = document.getElementById('missingKeywords');
const generateCoverBtn = document.getElementById('generateCoverBtn');
const coverLetterSection = document.getElementById('cover-letter-section');
const paymentArea = document.getElementById('paymentArea');
const coverLetterArea = document.getElementById('coverLetterArea');
const payBtn = document.getElementById('payBtn');
const generatedLetterEl = document.getElementById('generatedLetter');
const downloadBtn = document.getElementById('downloadBtn');

// Variables to hold text content
let resumeText = '';
let jobText = '';

// Utility: simple stopwords list for English; expand as needed
const stopwords = new Set([
  'the','and','a','an','of','to','in','for','on','with','at','by','from','up','about','into','over','after','is','are','was','were','be','been','being','that','this','these','those','as','it','he','she','they','them','his','her','their','you','your','i','we','our'
]);

// Helper to clean and split text into unique keywords
function extractKeywords(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[\d\W_]+/g, ' ') // replace non-word characters
      .split(/\s+/)
      .filter(word => word && !stopwords.has(word) && word.length > 2)
  );
}

// File reader
resumeInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    resumeText = evt.target.result;
    checkInputs();
  };
  // Try to read as text. If it's a PDF/docx the text may not extract properly.
  reader.readAsText(file);
});

jobDescriptionInput.addEventListener('input', () => {
  jobText = jobDescriptionInput.value;
  checkInputs();
});

function checkInputs() {
  analyzeBtn.disabled = !(resumeText && jobText);
}

analyzeBtn.addEventListener('click', () => {
  // Compute keywords
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobText);
  // Determine matching and missing keywords
  const matching = new Set();
  const missing = new Set();
  jobKeywords.forEach(word => {
    if (resumeKeywords.has(word)) {
      matching.add(word);
    } else {
      missing.add(word);
    }
  });
  // Compute match percentage
  const matchPercent = jobKeywords.size > 0 ? Math.round((matching.size / jobKeywords.size) * 100) : 0;
  // Render results
  matchScoreEl.textContent = `${matchPercent}%`;
  renderKeywordList(matchingKeywordsEl, Array.from(matching));
  renderKeywordList(missingKeywordsEl, Array.from(missing));
  resultsSection.hidden = false;
  generateCoverBtn.hidden = false;
});

function renderKeywordList(container, keywords) {
  container.innerHTML = '';
  if (keywords.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'None';
    container.appendChild(li);
    return;
  }
  keywords.slice(0, 30).forEach(keyword => {
    const li = document.createElement('li');
    li.textContent = keyword;
    container.appendChild(li);
  });
}

generateCoverBtn.addEventListener('click', () => {
  coverLetterSection.hidden = false;
});

// Simulated payment process
payBtn.addEventListener('click', () => {
  // Simulate payment by confirmation
  const confirmPayment = confirm('Proceed with payment of USD 5? (Simulation)');
  if (confirmPayment) {
    // Hide payment area and show cover letter area
    paymentArea.hidden = true;
    coverLetterArea.hidden = false;
    generateCoverLetter();
  }
});

function generateCoverLetter() {
  // Attempt to extract job title from first line of job description (simple heuristic)
  const firstLine = jobText.trim().split(/\n/)[0];
  const jobTitle = firstLine.split(/[,\-\.]/)[0].trim() || 'the position';
  // Prompt for candidate name (optional)
  let candidateName = localStorage.getItem('candidateName');
  if (!candidateName) {
    candidateName = prompt('Enter your name for the cover letter:', 'Your Name') || 'Candidate';
    localStorage.setItem('candidateName', candidateName);
  }
  // Select top matching keywords as highlights
  const matchWords = [];
  matchingKeywordsEl.querySelectorAll('li').forEach(li => {
    if (li.textContent !== 'None') matchWords.push(li.textContent);
  });
  const topHighlights = matchWords.slice(0, 5).join(', ');
  // Compose letter
  const letter = `Dear Hiring Manager,\n\n` +
    `I am writing to express my interest in ${jobTitle}. ` +
    `With my experience in ${topHighlights || 'relevant areas'}, I believe I can contribute effectively to your team. ` +
    `My background includes accomplishments that align closely with the requirements listed in your job description.\n\n` +
    `In my previous roles, I have demonstrated the ability to adapt quickly, learn new technologies and work collaboratively. ` +
    `I am confident that my skills make me a strong match for your needs and I would welcome the opportunity to discuss how I can bring value to your organisation.\n\n` +
    `Thank you for considering my application. I look forward to the possibility of discussing this opportunity further.\n\n` +
    `Sincerely,\n${candidateName}`;
  generatedLetterEl.value = letter;
  // Create downloadable blob
  const blob = new Blob([letter], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  downloadBtn.href = url;
}

// Update footer year
document.getElementById('currentYear').textContent = new Date().getFullYear();