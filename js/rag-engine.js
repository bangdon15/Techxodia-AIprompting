/**
 * Obelisk by TechXodia — High-Precision Client-Side RAG Simulator & Hybrid Retrieval Engine
 * TechXodia Showcase Edition
 */

export class RAGEngine {
  constructor(knowledgeBases) {
    this.knowledgeBases = knowledgeBases;
  }

  /**
   * Tokenize and normalize text for lexical BM25-like retrieval
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  /**
   * Retrieve Top-K relevant chunks using hybrid lexical + semantic keyword scoring
   */
  retrieveTopChunks(kbId, query, topK = 3) {
    const kb = this.knowledgeBases[kbId];
    if (!kb || !kb.documents) return [];

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const scoredChunks = [];

    kb.documents.forEach(doc => {
      doc.chunks.forEach(chunk => {
        const chunkText = chunk.text.toLowerCase();
        const chunkTokens = this.tokenize(chunkText);
        const keywords = (chunk.keywords || []).map(k => k.toLowerCase());

        // Lexical Overlap
        let matchScore = 0;
        let matchedKeywords = 0;

        queryTokens.forEach(token => {
          // Direct token inclusion in chunk text
          if (chunkText.includes(token)) {
            matchScore += 1.8;
          }
          // Exact keyword match boost
          if (keywords.some(kw => kw.includes(token) || token.includes(kw))) {
            matchScore += 3.2;
            matchedKeywords++;
          }
        });

        // Query phrase matching boost (consecutive words)
        const lowerQuery = query.toLowerCase().trim();
        if (chunkText.includes(lowerQuery)) {
          matchScore += 5.0;
        }

        // Normalize score between 0.0 and 1.0 using calibrated RAG curve
        const baseRatio = matchScore / (Math.max(queryTokens.length, 2) * 2.2);
        let normalizedScore = Math.min(0.994, Math.max(0.15, 1 / (1 + Math.exp(-3.5 * (baseRatio - 0.55)))));

        if (baseRatio >= 0.75) {
          normalizedScore = Math.min(0.994, 0.93 + (baseRatio - 0.75) * 0.1);
        }

        // Slight realistic jitter for showroom realism (e.g. 98.4%, 97.2%)
        normalizedScore = Math.round(normalizedScore * 1000) / 1000;

        if (matchScore > 0.5) {
          scoredChunks.push({
            score: normalizedScore,
            docTitle: doc.title,
            fileName: doc.fileName,
            fileType: doc.type,
            category: doc.category,
            chunkId: chunk.id,
            section: chunk.section,
            text: chunk.text,
            tokens: chunk.tokens,
            vectorId: chunk.vectorId
          });
        }
      });
    });

    // Sort descending by score
    scoredChunks.sort((a, b) => b.score - a.score);

    return scoredChunks.slice(0, topK);
  }

  /**
   * Calculate overall answer grounding score
   */
  calculateGroundingConfidence(topChunks) {
    if (!topChunks || topChunks.length === 0) {
      return {
        score: 0.28,
        label: 'Low Grounding / Unindexed',
        colorClass: 'confidence-low',
        percentage: 28.0
      };
    }

    const topScore = topChunks[0].score;
    const avgScore = topChunks.reduce((acc, c) => acc + c.score, 0) / topChunks.length;
    const weighted = Math.round((topScore * 0.7 + avgScore * 0.3) * 1000) / 10;

    if (weighted >= 88.0) {
      return {
        score: weighted / 100,
        label: 'High Grounding • RAG Verified',
        colorClass: 'confidence-high',
        percentage: weighted
      };
    } else if (weighted >= 60.0) {
      return {
        score: weighted / 100,
        label: 'Moderate Grounding',
        colorClass: 'confidence-medium',
        percentage: weighted
      };
    } else {
      return {
        score: weighted / 100,
        label: 'Low Grounding',
        colorClass: 'confidence-low',
        percentage: weighted
      };
    }
  }

  /**
   * Split arbitrary raw text into overlapping vector chunks
   */
  chunkText(text, targetTokens = 100, overlapTokens = 20) {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks = [];
    let currentWords = [];
    let chunkIndex = 1;

    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/);
      currentWords.push(...words);

      if (currentWords.length >= targetTokens) {
        chunks.push({
          id: `chunk-custom-${Date.now()}-${chunkIndex}`,
          section: `§${chunkIndex}.0 Document Segment`,
          text: currentWords.join(' '),
          keywords: this.extractKeywords(currentWords.join(' ')),
          tokens: Math.round(currentWords.length * 1.3),
          vectorId: `vec_usr_${Math.random().toString(36).substring(2, 8)}`
        });
        chunkIndex++;
        currentWords = currentWords.slice(-overlapTokens);
      }
    });

    if (currentWords.length > 5) {
      chunks.push({
        id: `chunk-custom-${Date.now()}-${chunkIndex}`,
        section: `§${chunkIndex}.0 Document Segment`,
        text: currentWords.join(' '),
        keywords: this.extractKeywords(currentWords.join(' ')),
        tokens: Math.round(currentWords.length * 1.3),
        vectorId: `vec_usr_${Math.random().toString(36).substring(2, 8)}`
      });
    }

    return chunks;
  }

  /**
   * Heuristic keyword extraction for ingested chunks
   */
  extractKeywords(text) {
    const stopWords = new Set(['the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were', 'which', 'your', 'will', 'are', 'not', 'can', 'has']);
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const counts = {};
    words.forEach(w => {
      if (!stopWords.has(w)) {
        counts[w] = (counts[w] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([w]) => w);
  }

  /**
   * Ingest a custom document into the active Knowledge Base
   */
  ingestDocument(kbId, { title, fileName, type, category, content }) {
    const kb = this.knowledgeBases[kbId];
    if (!kb) throw new Error(`Knowledge base ${kbId} not found.`);

    const chunks = this.chunkText(content);
    const newDoc = {
      id: `doc-custom-${Date.now()}`,
      title: title || fileName || 'Ingested Knowledge Source',
      fileName: fileName || `${title.toLowerCase().replace(/\s+/g, '_')}.md`,
      type: type || 'md',
      category: category || 'Custom Knowledge',
      size: `${Math.round(content.length / 1024 * 10) / 10} KB`,
      updatedAt: new Date().toISOString().split('T')[0],
      chunks: chunks
    };

    kb.documents.unshift(newDoc);
    kb.vectorCount += chunks.length;

    return {
      document: newDoc,
      chunksAdded: chunks.length,
      totalVectors: kb.vectorCount
    };
  }
}
