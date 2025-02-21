import axios from 'axios';
import translations from '~/data/translations.json';

const LIBRE_TRANSLATE_API = "https://libretranslate.de/translate";

if (!process.env.RAPIDAPI_KEY) {
  throw new Error("RAPIDAPI_KEY is required for translations");
}

export async function translateToEnglish(text: string): Promise<string> {
  if (!text || !text.trim()) {
    return text;
  }

  const textLower = text.toLowerCase().trim();

  // Check if we have an exact match in our translations
  if (translations.common[textLower]) {
    // Preserve the original casing if the first letter was uppercase
    if (text[0] === text[0].toUpperCase()) {
      return translations.common[textLower].charAt(0).toUpperCase() + 
             translations.common[textLower].slice(1);
    }
    return translations.common[textLower];
  }

  // Try to translate individual words if no exact match found
  const words = textLower.split(' ');
  if (words.length > 1) {
    const translatedWords = words.map(word => 
      translations.common[word] || word
    );
    const translated = translatedWords.join(' ');
    
    // Preserve the original casing if the first letter was uppercase
    if (text[0] === text[0].toUpperCase()) {
      return translated.charAt(0).toUpperCase() + translated.slice(1);
    }
    return translated;
  }

  // If no translation found, return original text
  return text;
}
