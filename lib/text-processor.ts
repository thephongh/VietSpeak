export interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  estimatedDuration: number;
}

export class TextProcessor {
  private static readonly WORDS_PER_MINUTE = 150; // Average reading speed
  private static readonly CHARACTERS_PER_MINUTE = 900; // Average character reading speed

  static cleanText(text: string): string {
    return text
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold/italic
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove markdown links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove email addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '')
      // Clean up multiple whitespaces
      .replace(/\s+/g, ' ')
      // Clean up multiple newlines
      .replace(/\n+/g, '\n')
      .trim();
  }

  static getTextStats(text: string): TextStats {
    const cleanedText = text.trim();
    
    if (!cleanedText) {
      return {
        characters: 0,
        words: 0,
        sentences: 0,
        estimatedDuration: 0,
      };
    }

    const characters = cleanedText.length;
    const words = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
    const sentences = cleanedText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    
    // Estimate duration based on character count (more accurate for Vietnamese)
    const estimatedDuration = Math.ceil((characters / this.CHARACTERS_PER_MINUTE) * 60);

    return {
      characters,
      words,
      sentences,
      estimatedDuration,
    };
  }

  static hasMarkdownFormatting(text: string): boolean {
    const markdownPatterns = [
      /^#{1,6}\s+/m, // Headers
      /(\*\*|__)(.*?)\1/, // Bold
      /(\*|_)(.*?)\1/, // Italic
      /\[([^\]]+)\]\([^)]+\)/, // Links
      /```[\s\S]*?```/, // Code blocks
      /`([^`]+)`/, // Inline code
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
  }

  static detectLanguage(text: string): string {
    const cleanedText = this.cleanText(text);
    
    // Vietnamese patterns
    const vietnamesePatterns = [
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi,
      /\b(và|của|trong|với|từ|về|cho|tại|trên|dưới|sau|trước|giữa|theo|bằng|qua|đến|nên|nếu|khi|mà|thì|để|sẽ|đã|đang|được|có|là|không|rất|nhiều|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\b/gi
    ];

    // English patterns
    const englishPatterns = [
      /\b(the|and|of|in|to|for|with|on|at|by|from|as|is|was|are|were|be|been|have|has|had|do|does|did|will|would|could|should|may|might|can|must|shall|this|that|these|those|a|an|but|or|so|if|when|where|why|how|what|who|which)\b/gi
    ];

    // French patterns
    const frenchPatterns = [
      /[àâäéèêëïîôöùûüÿç]/gi,
      /\b(le|la|les|de|des|du|un|une|et|à|il|elle|ils|elles|ce|cette|ces|dans|sur|avec|pour|par|sans|sous|entre|vers|chez|depuis|pendant|avant|après|très|plus|moins|tout|tous|toute|toutes|bien|mal|grand|petit|bon|mauvais|nouveau|vieux|jeune|beau|joli)\b/gi
    ];

    let vietnameseScore = 0;
    let englishScore = 0;
    let frenchScore = 0;

    vietnamesePatterns.forEach(pattern => {
      const matches = cleanedText.match(pattern);
      if (matches) vietnameseScore += matches.length;
    });

    englishPatterns.forEach(pattern => {
      const matches = cleanedText.match(pattern);
      if (matches) englishScore += matches.length;
    });

    frenchPatterns.forEach(pattern => {
      const matches = cleanedText.match(pattern);
      if (matches) frenchScore += matches.length;
    });

    if (vietnameseScore > englishScore && vietnameseScore > frenchScore) {
      return 'vi';
    } else if (frenchScore > englishScore && frenchScore > vietnameseScore) {
      return 'fr';
    } else if (englishScore > 0) {
      return 'en';
    }

    return 'unknown';
  }

  static splitLongText(text: string, maxLength: number = 5000): string[] {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks: string[] = [];
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          // Handle case where single sentence is longer than maxLength
          const words = sentence.split(/\s+/);
          let wordChunk = '';
          
          for (const word of words) {
            if ((wordChunk + word).length <= maxLength) {
              wordChunk += (wordChunk ? ' ' : '') + word;
            } else {
              if (wordChunk) {
                chunks.push(wordChunk.trim());
                wordChunk = word;
              } else {
                // Single word longer than maxLength - force split
                chunks.push(word.substring(0, maxLength));
                wordChunk = word.substring(maxLength);
              }
            }
          }
          
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks.filter(chunk => chunk.length > 0);
  }

  static validateText(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'Text cannot be empty' };
    }

    if (text.length > 10000) {
      return { isValid: false, error: 'Text is too long (maximum 10,000 characters)' };
    }

    // Check for potentially harmful content
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(text)) {
        return { isValid: false, error: 'Text contains potentially harmful content' };
      }
    }

    return { isValid: true };
  }
}