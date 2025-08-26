import { db } from '@/lib/db';
import { Source } from '@prisma/client';

export class DocumentSearchService {
  async search(query: string, projectId: string): Promise<Source[]> {
    const sources = await db.source.findMany({
      where: {
        project: {
          id: projectId,
        },
        textContent: {
          search: query,
        },
      },
    });
    return sources;
  }
}

export const documentSearchService = new DocumentSearchService();
