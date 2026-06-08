const { Anthropic } = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Initialize Anthropic client if key is available
const apiKey = process.env.ANTHROPIC_API_KEY;
const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

// Read SKILL files for context/prompts
const getSkillPrompt = (skillName) => {
  try {
    const rootPath = path.join(__dirname, '..', '..');
    const skillPath = path.join(rootPath, skillName, skillName, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      return fs.readFileSync(skillPath, 'utf8');
    }
  } catch (err) {
    console.error(`Error reading skill prompt for ${skillName}:`, err);
  }
  return '';
};

/**
 * Classify a planning application description or portal content.
 */
async function classifyApplication(inputContent) {
  if (!anthropic) {
    console.log('No ANTHROPIC_API_KEY configured. Running in Demo Mode.');
    return null; // Fallback to mock search results handled by route
  }

  const skillPrompt = getSkillPrompt('planning-classifier');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2500,
      temperature: 0.1,
      system: `You are the Flagstaffe Planning Application Classifier agent. Your instructions are detailed below:\n\n${skillPrompt}`,
      messages: [
        {
          role: 'user',
          content: `Please classify the following planning application details and extract the relevant fields:\n\n${inputContent}`
        }
      ]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error in Claude Classifier API call:', error);
    throw error;
  }
}

/**
 * Draft a bid document based on classification analysis and project detail.
 */
async function draftBidDocument(projectDetails) {
  if (!anthropic) {
    console.log('No ANTHROPIC_API_KEY configured. Running in Demo Mode.');
    return null; // Fallback to mock bid creation
  }

  const skillPrompt = getSkillPrompt('bid-writer');
  
  // Also load references
  let firmProfile = '';
  try {
    const profilePath = path.join(__dirname, '..', '..', 'bid-writer', 'bid-writer', 'references', 'firm-profile.md');
    if (fs.existsSync(profilePath)) {
      firmProfile = fs.readFileSync(profilePath, 'utf8');
    }
  } catch (e) {
    console.error(e);
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.2,
      system: `You are the Flagstaffe Bid Writer agent. Your instructions are detailed below:\n\n${skillPrompt}\n\nFirm Profile details:\n${firmProfile}`,
      messages: [
        {
          role: 'user',
          content: `Draft a professional bid document for this project:\n\n${JSON.stringify(projectDetails, null, 2)}`
        }
      ]
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error in Claude Bid Writer API call:', error);
    throw error;
  }
}

module.exports = {
  classifyApplication,
  draftBidDocument,
  isDemoMode: !anthropic
};
