import type { ReviewData, ReviewDataSeed } from '../types';
import { SummaryAdapter } from './SummaryAdapter';

export class ReviewDataAdapter {
  static fromSeed(seed: ReviewDataSeed): ReviewData {
    return {
      ...seed,
      summary: SummaryAdapter.fromSeed(seed),
    };
  }
}

