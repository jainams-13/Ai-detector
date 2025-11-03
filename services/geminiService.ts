import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, PlagiarismResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ['LIKELY_AI', 'LIKELY_HUMAN', 'UNCERTAIN'],
      description: "The final judgment on the content's origin.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "A confidence score from 0 to 100 for the verdict.",
    },
    explanation: {
      type: Type.STRING,
      description: "A detailed explanation for the verdict, summarizing the key findings.",
    },
    keyCharacteristics: {
      type: Type.ARRAY,
      description: "A list of specific characteristics found that support the verdict.",
      items: {
        type: Type.OBJECT,
        properties: {
          characteristic: {
            type: Type.STRING,
            description: "The name of the characteristic observed (e.g., 'Sentence Uniformity', 'Unnatural Textures', 'Temporal Inconsistency', 'Robotic Cadence').",
          },
          evidence: {
            type: Type.STRING,
            description: "A brief quote or description that serves as evidence for this characteristic.",
          },
        },
        required: ['characteristic', 'evidence'],
      },
    },
  },
  required: ['verdict', 'confidence', 'explanation', 'keyCharacteristics'],
};

const callGemini = async (contents: any, systemInstruction: string): Promise<AnalysisResult> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    return result as AnalysisResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid analysis from the AI model.");
  }
}


export const analyzeText = async (text: string, language: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are an expert multilingual linguistic analyst specializing in identifying the subtle differences between human-written and AI-generated text across various languages.
    Your analysis is based on patterns of perplexity, burstiness, lexical diversity, and personal voice, adapted for the specific language of the text.
    - LIKELY_AI: Text is consistent, uniform, and lacks the natural variance of human writing.
    - LIKELY_HUMAN: Text shows variability in sentence structure, uses a personal tone, and has higher "burstiness".
    - UNCERTAIN: The text has mixed signals or is too short to make a confident determination.
  `;

  // FIX: The errors reported indicate a major syntax issue, likely a misplaced brace,
  // which broke the function's scope. The function is rewritten here to be syntactically correct.
  // I also removed an unnecessary backslash from "language\'s".
  const languageInstruction = language === 'auto'
    ? "First, auto-detect the language of the following text. Then, please analyze the text based on that language's linguistic patterns."
    : `The following text is in ${language}. Please analyze it based on its linguistic patterns.`;

  const prompt = `${languageInstruction}\n\nTEXT:\n---\n${text}\n---`;
  return callGemini(prompt, systemInstruction);
};

export const checkPlagiarism = async (text: string): Promise<PlagiarismResult> => {
  const systemInstruction = `
    You are an expert plagiarism checker. Your task is to analyze the provided text and identify potential plagiarism by finding matching sources on the web.
    - Analyze the text for phrases, sentences, and paragraphs that match existing online content.
    - Provide an overall "similarityScore" as a percentage (0-100) representing the proportion of the text that is likely plagiarized.
    - List all "matchedSources" you find. For each source, include its "url", "title", "similarity" percentage for that specific source, and a "snippet" of the text that matches.
    - Provide a concise "summary" of your findings.
    - Your response MUST be a valid JSON object following the specified structure. Do not include any text or markdown formatting outside of the JSON object.
  `;
  
  const prompt = `
    Please perform a plagiarism check on the following text and return the result as a JSON object with this exact structure: { "similarityScore": number, "summary": string, "matchedSources": [{ "url": string, "title": string, "similarity": number, "snippet": string }] }.

    TEXT:
    ---
    ${text}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    let jsonString = response.text;
    jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    const result = JSON.parse(jsonString);

    return result as PlagiarismResult;
  } catch (error) {
    console.error("Error calling Gemini API for plagiarism check:", error);
    throw new Error("Failed to get a valid plagiarism analysis from the AI model.");
  }
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are an expert in digital image forensics specializing in detecting AI-generated images.
    Analyze the provided image for tell-tale signs of AI generation. Look for artifacts such as unnatural textures, inconsistent lighting, anatomical inaccuracies (especially hands and eyes), distorted backgrounds, and a lack of realistic imperfections.
    - LIKELY_AI: The image contains multiple common AI artifacts.
    - LIKELY_HUMAN: The image appears authentic and lacks typical AI-generated flaws.
    - UNCERTAIN: The image is ambiguous or of low quality, making a determination difficult.
  `;
  const prompt = "Please analyze the following image for signs of AI generation and provide your analysis in the specified JSON format.";
  
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };
  
  return callGemini({ parts: [{text: prompt}, imagePart] }, systemInstruction);
};

export const analyzeVideoFrames = async (frames: { base64: string; mimeType: string }[]): Promise<AnalysisResult> => {
    const systemInstruction = `
    You are an expert in digital video forensics specializing in detecting AI-generated video.
    The user has provided a sequence of frames from a video. Analyze these frames collectively for signs of AI generation. Pay close attention to temporal inconsistencies between frames, such as flickering, unnatural object morphing, lack of realistic motion blur, and strange background warping.
    - LIKELY_AI: The video frames show clear signs of temporal inconsistency or other common AI video artifacts.
    - LIKELY_HUMAN: The frames are consistent and appear to be from an authentic video recording.
    - UNCERTAIN: The frames are insufficient or of too low quality to make a confident determination.
  `;
  const prompt = "Please analyze the following video frames for signs of AI generation and provide your collective analysis in the specified JSON format.";

  const imageParts = frames.map(frame => ({
    inlineData: {
        data: frame.base64,
        mimeType: frame.mimeType
    }
  }));

  const contents = { parts: [{text: prompt}, ...imageParts] };
  return callGemini(contents, systemInstruction);
}

export const analyzeAudio = async (base64Audio: string, mimeType: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are an expert in audio forensics specializing in detecting AI-generated voices.
    Analyze the provided audio for signs of AI generation. Listen for unnatural prosody, metallic artifacts, lack of breaths or non-speech sounds, uniform pacing, and strange intonation.
    - LIKELY_AI: The audio has a robotic cadence, lacks human-like imperfections, or contains digital artifacts.
    - LIKELY_HUMAN: The audio includes natural speech patterns, breaths, and variable intonation.
    - UNCERTAIN: The audio quality is too low, or the speech is too brief to make a confident determination.
  `;
  const prompt = "Please analyze the following audio for signs of AI generation and provide your analysis in the specified JSON format.";
  
  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: mimeType,
    },
  };
  
  return callGemini({ parts: [{text: prompt}, audioPart] }, systemInstruction);
};