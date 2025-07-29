/**
 * Text processing utilities for cleaning markdown and formatting
 */

export interface TextProcessingOptions {
  removeMarkdown?: boolean;
  removeLinks?: boolean;
  removeEmojis?: boolean;
  normalizeWhitespace?: boolean;
  removeBrackets?: boolean;
  removeSpecialChars?: boolean;
}

export class TextProcessor {
  private static readonly DEFAULT_OPTIONS: TextProcessingOptions = {
    removeMarkdown: true,
    removeLinks: true,
    removeEmojis: false,
    normalizeWhitespace: true,
    removeBrackets: true,
    removeSpecialChars: false
  };

  /**
   * Clean text by removing markdown, formatting, and unwanted characters
   */
  static cleanText(text: string, options: TextProcessingOptions = {}): string {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    let cleaned = text;

    if (opts.removeMarkdown) {
      cleaned = this.removeMarkdownFormatting(cleaned);
    }

    if (opts.removeLinks) {
      cleaned = this.removeLinks(cleaned);
    }

    if (opts.removeBrackets) {
      cleaned = this.removeBrackets(cleaned);
    }

    if (opts.removeEmojis) {
      cleaned = this.removeEmojis(cleaned);
    }

    if (opts.removeSpecialChars) {
      cleaned = this.removeSpecialCharacters(cleaned);
    }

    if (opts.normalizeWhitespace) {
      cleaned = this.normalizeWhitespace(cleaned);
    }

    return cleaned.trim();
  }

  /**
   * Remove markdown formatting (headers, bold, italic, code, etc.)
   */
  private static removeMarkdownFormatting(text: string): string {
    return text
      // Remove headers (# ## ### etc.)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold and italic (**text**, *text*, __text__, _text_)
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove strikethrough (~~text~~)
      .replace(/~~(.*?)~~/g, '$1')
      // Remove inline code (`code`)
      .replace(/`([^`]+)`/g, '$1')
      // Remove code blocks (```code```)
      .replace(/```[\s\S]*?```/g, '')
      // Remove blockquotes (> text)
      .replace(/^>\s+/gm, '')
      // Remove horizontal rules (--- or ***)
      .replace(/^(---|\*\*\*|___)\s*$/gm, '')
      // Remove list markers (- * + and numbers)
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove table formatting
      .replace(/\|/g, ' ')
      .replace(/^[\s]*:?-+:?[\s]*$/gm, '');
  }

  /**
   * Remove URLs and markdown links
   */
  private static removeLinks(text: string): string {
    return text
      // Remove markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown reference links [text][ref]
      .replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
      // Remove reference definitions [ref]: url
      .replace(/^\s*\[[^\]]+\]:\s+.+$/gm, '')
      // Remove bare URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove email addresses
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  }

  /**
   * Remove bracket content [like this] and (like this)
   */
  private static removeBrackets(text: string): string {
    return text
      // Remove square brackets and content
      .replace(/\[[^\]]*\]/g, '')
      // Remove parentheses with content (but keep Vietnamese pronunciation guides)
      .replace(/\([^)]*\)/g, '');
  }

  /**
   * Remove emojis and emoticons
   */
  private static removeEmojis(text: string): string {
    return text
      // Remove emoji characters using surrogate pairs
      .replace(/[\uD83C-\uDBFF][\uDC00-\uDFFF]/g, '')
      // Remove additional emoji ranges
      .replace(/[\u2600-\u27BF]/g, '')
      // Remove emoticons :) :( :D etc.
      .replace(/[:\;][-)DPp\(\)\[\]\\\/\|oO0]/g, '');
  }

  /**
   * Remove special characters that might cause TTS issues
   */
  private static removeSpecialCharacters(text: string): string {
    return text
      // Keep Vietnamese characters, letters, numbers, basic punctuation
      .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF.,!?;:\-'"]/g, '')
      // Remove multiple dashes
      .replace(/-{2,}/g, ' - ')
      // Remove multiple underscores
      .replace(/_{2,}/g, ' ');
  }

  /**
   * Normalize whitespace (multiple spaces, tabs, newlines)
   */
  private static normalizeWhitespace(text: string): string {
    return text
      // Replace multiple whitespace with single space
      .replace(/\s+/g, ' ')
      // Replace multiple newlines with double newline
      .replace(/\n{3,}/g, '\n\n')
      // Clean up spaces around punctuation
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/([.,!?;:])\s+/g, '$1 ')
      // Remove leading/trailing whitespace on each line
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  }

  /**
   * Detect if text contains markdown formatting
   */
  static hasMarkdownFormatting(text: string): boolean {
    const markdownPatterns = [
      /^#{1,6}\s+/m,           // Headers
      /\*\*.*?\*\*/,           // Bold
      /\*.*?\*/,               // Italic
      /`.*?`/,                 // Inline code
      /```[\s\S]*?```/,        // Code blocks
      /\[.*?\]\(.*?\)/,        // Links
      /^[\s]*[-*+]\s+/m,       // Lists
      /^>\s+/m,                // Blockquotes
      /\|.*\|/                 // Tables
    ];

    return markdownPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Get text statistics
   */
  static getTextStats(text: string): {
    characters: number;
    words: number;
    sentences: number;
    estimatedDuration: number; // in seconds
  } {
    const characters = text.length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // Estimate duration: average 150 words per minute
    const estimatedDuration = Math.ceil((words / 150) * 60);

    return {
      characters,
      words,
      sentences,
      estimatedDuration
    };
  }

  /**
   * Extract preview text (first few sentences)
   */
  static getPreview(text: string, maxLength: number = 200): string {
    if (text.length <= maxLength) {
      return text;
    }

    const sentences = text.split(/[.!?]+/);
    let preview = '';
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (preview.length + trimmed.length + 1 <= maxLength) {
        preview += (preview.length > 0 ? '. ' : '') + trimmed;
      } else {
        break;
      }
    }

    return preview + (preview.length < text.length ? '...' : '');
  }
}