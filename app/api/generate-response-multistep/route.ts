import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { organizationService } from '@/lib/organization-service';
import { db } from '@/lib/db';
import { documentSearchService } from '@/lib/services/document-search-service';
import { localLLMClient } from '@/lib/services/local-llm-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, projectId } = body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages array is required', { status: 400 });
    }
    
    if (!projectId) {
      return new Response('Project ID is required', { status: 400 });
    }
    
    const latestMessage = messages[messages.length - 1];
    const question = latestMessage?.content;
    
    if (!question) {
      return new Response('Question content is required', { status: 400 });
    }

    const currentUser = await organizationService.getCurrentUser();
    if (!currentUser) {
      return new Response('Authentication required', { status: 401 });
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });

    if (!project) {
      return new Response('Project not found', { status: 404 });
    }

    const isMember = await organizationService.isUserOrganizationMember(
      currentUser.id,
      project.organizationId
    );
    
    if (!isMember) {
      return new Response('Access denied', { status: 403 });
    }

    const sources = await documentSearchService.search(question, projectId);
    const context = sources.map(s => s.textContent).join('\n\n');

    const responseText = await localLLMClient.generate(
      'gemma:3n',
      `Question: ${question}\n\nContext: ${context}\n\nAnswer:`
    );

    return NextResponse.json({ response: responseText, sources });

  } catch (error) {
    console.error('Multi-step generation failed:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
