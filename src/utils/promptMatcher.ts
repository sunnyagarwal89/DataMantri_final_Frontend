import OpenAI from 'openai';
import { DashboardTemplate, PromptMatchResult } from '../types/dashboard';

export class PromptMatcher {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateDashboardFromPrompt(
    prompt: string,
    templates: DashboardTemplate[]
  ): Promise<PromptMatchResult> {
    // First, try keyword matching
    const keywordMatch = this.matchByKeywords(prompt, templates);

    if (keywordMatch && keywordMatch.confidence > 0.7) {
      return keywordMatch;
    }

    // If no good keyword match, try AI matching
    if (this.openai && this.apiKey) {
      try {
        const aiMatch = await this.matchByAI(prompt, templates);
        return aiMatch;
      } catch (error) {
        console.warn('AI matching failed, falling back to keyword match:', error);
        return keywordMatch || { template: null, confidence: 0, reason: 'No match found' };
      }
    }

    // Return the best keyword match or null
    return keywordMatch || { template: null, confidence: 0, reason: 'No match found' };
  }

  private matchByKeywords(prompt: string, templates: DashboardTemplate[]): PromptMatchResult | null {
    const promptLower = prompt.toLowerCase();
    let bestMatch: PromptMatchResult | null = null;
    let highestScore = 0;

    for (const template of templates) {
      let score = 0;
      const reasons: string[] = [];

      // Match template name
      if (template.name.toLowerCase().includes(promptLower)) {
        score += 3;
        reasons.push(`Template name matches: "${template.name}"`);
      }

      // Match description
      if (template.description.toLowerCase().includes(promptLower)) {
        score += 2;
        reasons.push(`Description matches: "${template.description}"`);
      }

      // Match category
      if (template.category.toLowerCase().includes(promptLower)) {
        score += 2;
        reasons.push(`Category matches: "${template.category}"`);
      }

      // Match tags
      const matchingTags = template.tags.filter(tag =>
        promptLower.includes(tag.toLowerCase())
      );
      if (matchingTags.length > 0) {
        score += matchingTags.length * 1.5;
        reasons.push(`Tags match: ${matchingTags.join(', ')}`);
      }

      // Match component types with proper type checking
      const validChartTypes = ['bar', 'line', 'pie', 'area', 'scatter'] as const;
      type ChartType = typeof validChartTypes[number];
      
      const componentTypes = new Set<ChartType>(
        template.components
          .map(c => c.type)
          .filter((type): type is ChartType => 
            validChartTypes.includes(type as ChartType)
          )
      );
      
      const promptTypes = this.extractChartTypesFromPrompt(prompt).filter(
        (type): type is ChartType => validChartTypes.includes(type as ChartType)
      );
      
      const matchingTypes = promptTypes.filter(type => componentTypes.has(type));
      if (matchingTypes.length > 0) {
        score += matchingTypes.length * 1;
        reasons.push(`Chart types match: ${matchingTypes.join(', ')}`);
      }

      const confidence = Math.min(score / 10, 1); // Normalize to 0-1

      if (confidence > highestScore) {
        highestScore = confidence;
        bestMatch = {
          template,
          confidence,
          reason: reasons.join('; ')
        };
      }
    }

    return bestMatch;
  }

  private async matchByAI(prompt: string, templates: DashboardTemplate[]): Promise<PromptMatchResult> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    const templateDescriptions = templates.map(t =>
      `Template: ${t.name}
Description: ${t.description}
Category: ${t.category}
Tags: ${t.tags.join(', ')}
Components: ${t.components.map(c => `${c.type} chart - ${c.title}`).join(', ')}`
    ).join('\n\n');

    const systemPrompt = `You are an AI assistant that matches user prompts to dashboard templates.
Given a user prompt and a list of available dashboard templates, select the most appropriate template.

Your response should be in JSON format:
{
  "templateId": "the ID of the selected template",
  "confidence": "confidence score between 0 and 1",
  "reason": "brief explanation of why this template was chosen"
}

Choose the template that best matches the user's intent. Consider:
- The purpose and content of the prompt
- The template's name, description, and category
- The types of charts in the template
- The overall theme and data visualization needs

If no template is a good match, set templateId to null and confidence to 0.`;

    const userPrompt = `User Prompt: "${prompt}"

Available Templates:
${templateDescriptions}

Please select the best matching template and explain your reasoning.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(content);

      const template = templates.find(t => t.id === result.templateId) || null;
      const confidence = Math.min(result.confidence || 0, 1);

      return {
        template,
        confidence,
        reason: result.reason || 'AI-powered matching'
      };
    } catch (error) {
      console.error('Error in AI matching:', error);
      throw error;
    }
  }

  private extractChartTypesFromPrompt(prompt: string): string[] {
    const types: string[] = [];
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('bar') || promptLower.includes('comparison') || promptLower.includes('categories')) {
      types.push('bar');
    }
    if (promptLower.includes('line') || promptLower.includes('trend') || promptLower.includes('time series')) {
      types.push('line');
    }
    if (promptLower.includes('pie') || promptLower.includes('percentage') || promptLower.includes('distribution')) {
      types.push('pie');
    }
    if (promptLower.includes('area') || promptLower.includes('stacked')) {
      types.push('area');
    }
    if (promptLower.includes('scatter') || promptLower.includes('correlation')) {
      types.push('scatter');
    }

    return types;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.openai = new OpenAI({ apiKey });
  }
}
