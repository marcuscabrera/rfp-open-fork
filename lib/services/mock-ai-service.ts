import { IAIQuestionExtractor, IAIResponseGenerator } from '@/lib/interfaces/ai-service';
import { ExtractedQuestions } from '@/lib/validators/extract-questions';

export class MockAIQuestionExtractor implements IAIQuestionExtractor {
  async extractQuestions(content: string, documentName: string): Promise<ExtractedQuestions> {
    return {
      sections: [
        {
          section_title: 'Mock Section',
          questions: [
            {
              question_id: '1.1',
              question_text: 'This is a mock question.',
            },
          ],
        },
      ],
    };
  }

  async generateSummary(content: string, documentName: string): Promise<string> {
    return 'This is a mock summary.';
  }

  async extractEligibility(content: string, documentName: string): Promise<string[]> {
    return ['This is a mock eligibility requirement.'];
  }
}

export class MockAIResponseGenerator implements IAIResponseGenerator {
  async generateResponse(question: string, context: string): Promise<string> {
    return 'This is a mock response.';
  }
}
