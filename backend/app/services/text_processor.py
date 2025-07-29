import re
from typing import Dict, Optional
from dataclasses import dataclass

@dataclass
class TextStats:
    """Statistics about processed text"""
    characters: int
    words: int
    sentences: int
    estimated_duration: int  # in seconds

class TextProcessor:
    """Service for cleaning and processing text before TTS synthesis"""
    
    @staticmethod
    def clean_text(
        text: str,
        remove_markdown: bool = True,
        remove_links: bool = True,
        remove_brackets: bool = True,
        normalize_whitespace: bool = True,
        remove_special_chars: bool = False
    ) -> str:
        """
        Clean text by removing markdown, formatting, and unwanted characters
        """
        cleaned = text
        
        if remove_markdown:
            cleaned = TextProcessor._remove_markdown_formatting(cleaned)
        
        if remove_links:
            cleaned = TextProcessor._remove_links(cleaned)
            
        if remove_brackets:
            cleaned = TextProcessor._remove_brackets(cleaned)
            
        if remove_special_chars:
            cleaned = TextProcessor._remove_special_characters(cleaned)
            
        if normalize_whitespace:
            cleaned = TextProcessor._normalize_whitespace(cleaned)
            
        return cleaned.strip()
    
    @staticmethod
    def _remove_markdown_formatting(text: str) -> str:
        """Remove markdown formatting"""
        # Remove headers (# ## ### etc.)
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        
        # Remove bold and italic (**text**, *text*, __text__, _text_)
        text = re.sub(r'(\*\*|__)(.*?)\1', r'\2', text)
        text = re.sub(r'(\*|_)(.*?)\1', r'\2', text)
        
        # Remove strikethrough (~~text~~)
        text = re.sub(r'~~(.*?)~~', r'\1', text)
        
        # Remove inline code (`code`)
        text = re.sub(r'`([^`]+)`', r'\1', text)
        
        # Remove code blocks (```code```)
        text = re.sub(r'```[\s\S]*?```', '', text)
        
        # Remove blockquotes (> text)
        text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)
        
        # Remove horizontal rules (--- or ***)
        text = re.sub(r'^(---|\*\*\*|___)\s*$', '', text, flags=re.MULTILINE)
        
        # Remove list markers (- * + and numbers)
        text = re.sub(r'^[\s]*[-*+]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^[\s]*\d+\.\s+', '', text, flags=re.MULTILINE)
        
        # Remove table formatting
        text = text.replace('|', ' ')
        text = re.sub(r'^[\s]*:?-+:?[\s]*$', '', text, flags=re.MULTILINE)
        
        return text
    
    @staticmethod
    def _remove_links(text: str) -> str:
        """Remove URLs and markdown links"""
        # Remove markdown links [text](url)
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        
        # Remove markdown reference links [text][ref]
        text = re.sub(r'\[([^\]]+)\]\[[^\]]*\]', r'\1', text)
        
        # Remove reference definitions [ref]: url
        text = re.sub(r'^\s*\[[^\]]+\]:\s+.+$', '', text, flags=re.MULTILINE)
        
        # Remove bare URLs
        text = re.sub(r'https?://[^\s]+', '', text)
        
        # Remove email addresses
        text = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '', text)
        
        return text
    
    @staticmethod
    def _remove_brackets(text: str) -> str:
        """Remove bracket content [like this] and (like this)"""
        # Remove square brackets and content
        text = re.sub(r'\[[^\]]*\]', '', text)
        
        # Remove parentheses with content
        text = re.sub(r'\([^)]*\)', '', text)
        
        return text
    
    @staticmethod
    def _remove_special_characters(text: str) -> str:
        """Remove special characters that might cause TTS issues"""
        # Keep Vietnamese characters, letters, numbers, basic punctuation
        text = re.sub(r'[^\w\s\u00C0-\u024F\u1E00-\u1EFF.,!?;:\-\'"]', '', text)
        
        # Remove multiple dashes
        text = re.sub(r'-{2,}', ' - ', text)
        
        # Remove multiple underscores
        text = re.sub(r'_{2,}', ' ', text)
        
        return text
    
    @staticmethod
    def _normalize_whitespace(text: str) -> str:
        """Normalize whitespace (multiple spaces, tabs, newlines)"""
        # Replace multiple whitespace with single space
        text = re.sub(r'\s+', ' ', text)
        
        # Replace multiple newlines with double newline
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Clean up spaces around punctuation
        text = re.sub(r'\s+([.,!?;:])', r'\1', text)
        text = re.sub(r'([.,!?;:])\s+', r'\1 ', text)
        
        # Remove leading/trailing whitespace on each line
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        text = '\n'.join(lines)
        
        return text
    
    @staticmethod
    def has_markdown_formatting(text: str) -> bool:
        """Detect if text contains markdown formatting"""
        markdown_patterns = [
            r'^#{1,6}\s+',           # Headers
            r'\*\*.*?\*\*',          # Bold
            r'\*.*?\*',              # Italic
            r'`.*?`',                # Inline code
            r'```[\s\S]*?```',       # Code blocks
            r'\[.*?\]\(.*?\)',       # Links
            r'^[\s]*[-*+]\s+',       # Lists
            r'^>\s+',                # Blockquotes
            r'\|.*\|'                # Tables
        ]
        
        for pattern in markdown_patterns:
            if re.search(pattern, text, re.MULTILINE):
                return True
        
        return False
    
    @staticmethod
    def get_text_stats(text: str) -> TextStats:
        """Get text statistics"""
        characters = len(text)
        words = len([word for word in text.split() if word.strip()])
        sentences = len([s for s in re.split(r'[.!?]+', text) if s.strip()])
        
        # Estimate duration: average 150 words per minute
        estimated_duration = max(1, int((words / 150) * 60))
        
        return TextStats(
            characters=characters,
            words=words,
            sentences=sentences,
            estimated_duration=estimated_duration
        )
    
    @staticmethod
    def get_preview(text: str, max_length: int = 200) -> str:
        """Extract preview text (first few sentences)"""
        if len(text) <= max_length:
            return text
        
        sentences = re.split(r'[.!?]+', text)
        preview = ''
        
        for sentence in sentences:
            trimmed = sentence.strip()
            if len(preview) + len(trimmed) + 1 <= max_length:
                preview += ('. ' if preview else '') + trimmed
            else:
                break
        
        return preview + ('...' if len(preview) < len(text) else '')
    
    @staticmethod
    def detect_language(text: str) -> str:
        """
        Simple language detection for Vietnamese, English, and French
        Returns 'vi', 'en', 'fr', or 'unknown'
        """
        # Vietnamese diacritics and common words
        vietnamese_chars = r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]'
        vietnamese_words = ['và', 'của', 'có', 'được', 'này', 'cho', 'với', 'từ', 'theo', 'người']
        
        # French diacritics and common words
        french_chars = r'[àáâäçéèêëîïôöùúûüÿñæœ]'
        french_words = ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour']
        
        # English common words (no diacritics)
        english_words = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with']
        
        text_lower = text.lower()
        
        # Check for Vietnamese characteristics
        vietnamese_score = 0
        if re.search(vietnamese_chars, text):
            vietnamese_score += 3
        vietnamese_score += sum(1 for word in vietnamese_words if word in text_lower)
        
        # Check for French characteristics
        french_score = 0
        if re.search(french_chars, text):
            french_score += 2
        french_score += sum(1 for word in french_words if word in text_lower)
        
        # Check for English characteristics
        english_score = sum(1 for word in english_words if word in text_lower)
        
        # Determine language based on scores
        if vietnamese_score > french_score and vietnamese_score > english_score:
            return 'vi'
        elif french_score > english_score:
            return 'fr'
        elif english_score > 0:
            return 'en'
        else:
            return 'unknown'