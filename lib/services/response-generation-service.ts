import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';
import { documentSearchService } from './document-search-service';
import { localLLMClient } from './local-llm-client';
import { 
  GenerateResponseRequest, 
  GenerateResponseResponse,
  GenerateResponseMetadata 
} from '@/lib/validators/generate-response';
import {
  AuthorizationError,
  ForbiddenError,
  NotFoundError,
} from '@/lib/errors/api-errors';

export class ResponseGenerationService {
  async generateResponse(request: GenerateResponseRequest): Promise<GenerateResponseResponse> {
    const currentUser = await this.getCurrentUser();
    await this.authorizeProjectAccess(request.projectId, currentUser.id);
    
    const sources = await documentSearchService.search(request.question, request.projectId);
    const context = sources.map(s => s.textContent).join('\n\n');

    const responseText = await localLLMClient.generate(
      'gemma:3n',
      `Question: ${request.question}\n\nContext: ${context}\n\nAnswer:`
    );

    const metadata: GenerateResponseMetadata = {
      confidence: 0.9, // Mock confidence
      generatedAt: new Date().toISOString(),
      indexesUsed: [],
    };

    return {
      success: true,
      response: responseText,
      sources: sources.map(s => ({
        id: s.id,
        documentId: s.documentId || '',
        fileName: s.fileName,
        filePath: s.filePath || '',
        pageNumber: s.pageNumber || '',
        relevance: 0.9, // Mock relevance
      })),
      metadata,
    };
  }

  private async getCurrentUser() {
    const currentUser = await organizationService.getCurrentUser();
    if (!currentUser) {
      throw new AuthorizationError();
    }
    return currentUser;
  }

  private async authorizeProjectAccess(projectId: string, userId: string): Promise<void> {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isMember = await organizationService.isUserOrganizationMember(
      userId,
      project.organizationId
    );
    
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this project');
    }
  }
}
