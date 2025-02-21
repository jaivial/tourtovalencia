import fetch from 'node-fetch';

const LIBRE_TRANSLATE_API = "https://libretranslate.de/translate";

export async function translateToEnglish(text: string): Promise<string> {
  try {
    const response = await fetch(LIBRE_TRANSLATE_API, {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "es",
        target: "en",
        format: "text"
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Translation failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text");
  }
}
