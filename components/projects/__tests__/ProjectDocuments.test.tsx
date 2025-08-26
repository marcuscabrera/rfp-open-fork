import { describe, it, expect } from 'vitest';

import { formatFileSize } from '../ProjectDocuments';

describe('formatFileSize', () => {
  it('returns "0 B" for 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('returns "2 KB" for 2048 bytes', () => {
    expect(formatFileSize(2048)).toBe('2 KB');
  });
});

