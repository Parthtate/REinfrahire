// @ts-ignore
import { pipeline, env } from '@xenova/transformers';

// Configuration to skip local model checks if not needed, 
// though for this use case we want to download the quantized model.
env.allowLocalModels = false;
env.useBrowserCache = false;

// Embedding Model Constants
const MODEL_NAME = 'sentence-transformers/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSION = 384; 

/**
 * Singleton class to ensure we only load the heavy model once per server instance.
 * This is crucial for Next.js API routes (serverless/Node).
 */
class EmbeddingPipeline {
  static task = 'feature-extraction' as const;
  static model = MODEL_NAME;
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      console.log('📦 Loading embedding model locally:', this.model);
      this.instance = await pipeline(this.task, this.model, {
        quantized: true, // Use quantized model for speed/memory
      });
      console.log('✅ Model loaded successfully');
    }
    return this.instance;
  }
}

interface EmbeddingCache {
  [key: string]: {
    embedding: number[];
    timestamp: number;
  };
}

const embeddingCache: EmbeddingCache = {};
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper for caching
function getCacheKey(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `emb_local_${hash}`;
}

/**
 * Generates an embedding for a single text string using local ONNX runtime.
 * Returns a 384-dimensional vector.
 */
export async function generateEmbedding(text: string, useCache = true): Promise<number[]> {
  const cacheKey = getCacheKey(text);
  
  if (useCache && embeddingCache[cacheKey]) {
    const cached = embeddingCache[cacheKey];
    if (Date.now() - cached.timestamp < CACHE_TTL) {
       return cached.embedding;
    }
  }

  // Generate embedding
  const extractor = await EmbeddingPipeline.getInstance();
  
  // "mean_pooling": true is essential for sentence-transformers to get a single vector per sentence
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  
  // output.data is a Float32Array
  const embedding = Array.from(output.data) as number[];

  if (embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(`Embedding dimension mismatch. Expected ${EMBEDDING_DIMENSION}, got ${embedding.length}`);
  }

  // Cache
  embeddingCache[cacheKey] = {
    embedding,
    timestamp: Date.now()
  };

  return embedding;
}

/**
 * Batch processing helper
 */
export async function generateBatchEmbeddings(
  texts: string[],
  onProgress?: (current: number, total: number) => void
): Promise<number[][]> {
  const results: number[][] = [];
  
  // Process sequentially to manage memory on free tiers
  for (let i = 0; i < texts.length; i++) {
    const emb = await generateEmbedding(texts[i], true);
    results.push(emb);
    if (onProgress) onProgress(i + 1, texts.length);
  }
  
  return results;
}