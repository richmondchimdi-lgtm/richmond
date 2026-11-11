import { AlgorithmVector, ContentCategory, VideoFeedItem } from '../types';

const STORAGE_KEY = 'vyro_algo_vector_v1';

const DEFAULT_VECTOR: AlgorithmVector = {
  tech: 50,
  anime: 50,
  music: 50,
  comedy: 50,
  gaming: 50,
  fashion: 50,
  lifestyle: 50,
  totalWatchSeconds: 0,
  completedVideosCount: 0,
  skippedVideosCount: 0,
  likedCreators: [],
};

class RecommendationEngine {
  private vector: AlgorithmVector;
  private listeners: ((vector: AlgorithmVector) => void)[] = [];

  constructor() {
    this.vector = this.loadVector();
  }

  private loadVector(): AlgorithmVector {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_VECTOR, ...JSON.parse(saved) };
      }
    } catch {}
    return { ...DEFAULT_VECTOR };
  }

  private saveVector() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.vector));
      this.listeners.forEach((fn) => fn({ ...this.vector }));
    } catch {}
  }

  public getVector(): AlgorithmVector {
    return { ...this.vector };
  }

  public subscribe(listener: (vector: AlgorithmVector) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Called when video completes or loops (>85% watched)
  public recordCompletion(category: ContentCategory, creatorId: string, durationSec: number) {
    this.vector[category] = Math.min(100, (this.vector[category] || 50) + 12);
    this.vector.totalWatchSeconds += Math.round(durationSec);
    this.vector.completedVideosCount += 1;
    if (!this.vector.likedCreators.includes(creatorId)) {
      this.vector.likedCreators.push(creatorId);
    }
    this.saveVector();
  }

  // Called when video is skipped in under 2 seconds
  public recordSkip(category: ContentCategory) {
    this.vector[category] = Math.max(5, (this.vector[category] || 50) - 8);
    this.vector.skippedVideosCount += 1;
    this.saveVector();
  }

  // Called on explicit like
  public recordLike(category: ContentCategory, creatorId: string) {
    this.vector[category] = Math.min(100, (this.vector[category] || 50) + 18);
    if (!this.vector.likedCreators.includes(creatorId)) {
      this.vector.likedCreators.push(creatorId);
    }
    this.saveVector();
  }

  // Called on share
  public recordShare(category: ContentCategory) {
    this.vector[category] = Math.min(100, (this.vector[category] || 50) + 20);
    this.saveVector();
  }

  // Called on bookmark save
  public recordSave(category: ContentCategory) {
    this.vector[category] = Math.min(100, (this.vector[category] || 50) + 16);
    this.saveVector();
  }

  // Re-rank a video feed array based on the dynamic algorithm
  public rankFeed(videos: VideoFeedItem[]): VideoFeedItem[] {
    return [...videos].sort((a, b) => {
      const weightA = (this.vector[a.category] || 50) + (this.vector.likedCreators.includes(a.author.id) ? 20 : 0);
      const weightB = (this.vector[b.category] || 50) + (this.vector.likedCreators.includes(b.author.id) ? 20 : 0);
      // Add slight jitter for serendipitous discovery
      return (weightB + Math.random() * 5) - (weightA + Math.random() * 5);
    });
  }

  // Manual fine-tune by user in Algorithm Inspector
  public updateCategoryWeight(category: ContentCategory, weight: number) {
    this.vector[category] = Math.max(0, Math.min(100, weight));
    this.saveVector();
  }

  // Reset algorithm to default neutral state
  public resetAlgorithm() {
    this.vector = { ...DEFAULT_VECTOR };
    this.saveVector();
  }
}

export const recommendationEngine = new RecommendationEngine();
