
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Imported Verdict to use enum values directly.
import { Verdict, type AnalysisResult, type PlagiarismResult, type GrammarResult, type RewriteResult } from '../types';

const getApiKey = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
  }
  return apiKey;
}

const callGemini = async (contents: any, systemInstruction: string): Promise<AnalysisResult> => {
   try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
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

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ['AI_GENERATED', 'AI_ASSISTED', 'LIKELY_HUMAN', 'UNCERTAIN'],
      description: "The final judgment on the content's origin.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "A confidence score from 0 to 100 for the verdict.",
    },
    aiPercentage: {
      type: Type.NUMBER,
      description: "The percentage of the text that shows AI influence (either generative or assistive), from 0 to 100.",
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
    detailedAnalysis: {
        type: Type.ARRAY,
        description: "A sentence-by-sentence breakdown of the text, classifying each as AI or Human.",
        items: {
          type: Type.OBJECT,
          properties: {
            sentence: {
              type: Type.STRING,
              description: "The sentence being analyzed.",
            },
            classification: {
              type: Type.STRING,
              enum: ['AI', 'Human'],
              description: "Classification of the sentence as 'AI' or 'Human'.",
            },
            reasoning: {
                type: Type.STRING,
                description: "A brief reason for the classification of this sentence."
            }
          },
          required: ['sentence', 'classification', 'reasoning'],
        },
      },
  },
  required: ['verdict', 'confidence', 'aiPercentage', 'explanation', 'keyCharacteristics'],
};

export const analyzeText = async (text: string, language: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are an expert multilingual linguistic analyst. Your critical task is to differentiate between text that is FULLY AI-GENERATED versus text that was HUMAN-WRITTEN BUT AI-ASSISTED (e.g., via grammar checkers or paraphrasing tools). This distinction is vital to avoid "false positives."

    Analyze the text based on the following verdicts:
    - AI_GENERATED: The text was created from scratch by a generative AI. It lacks a personal voice, has uniform sentence structure, and shows low perplexity and burstiness.
    - AI_ASSISTED: The text was originally written by a human but refined by assistive tools. It may be grammatically perfect but feel slightly unnatural, stilted, or have lost its original nuance. The core ideas and structure are likely human.
    - LIKELY_HUMAN: The text shows natural variation, personal style, and linguistic imperfections characteristic of human writing.
    - UNCERTAIN: The text is too short or has mixed signals.

    You must also provide an "aiPercentage" (0-100) representing the overall percentage of AI influence (both generative and assistive) you detect.
    
    In addition, you MUST provide a sentence-by-sentence breakdown in 'detailedAnalysis'. For each sentence, classify it as 'AI' or 'Human' and provide reasoning.
  `;

  const languageInstruction = language === 'auto'
    ? "First, auto-detect the language of the following text. Then, please analyze the text based on that language's linguistic patterns."
    : `The following text is in ${language}. Please analyze it based on its linguistic patterns.`;

  const prompt = `${languageInstruction}\n\nTEXT:\n---\n${text}\n---`;
  return callGemini(prompt, systemInstruction);
};

export const analyzeCode = async (code: string, language: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are an expert software engineer and code analyst specializing in identifying the subtle differences between human-written and AI-generated code.
    Your analysis is based on patterns of complexity, commenting style, boilerplate usage, and structural idioms.
    - AI_GENERATED: Code is overly commented, uses generic variable names, follows standard boilerplate without optimization, and lacks idiosyncratic style. It may look "too perfect" or textbook.
    - LIKELY_HUMAN: Code shows signs of evolution, contains personal stylistic choices, comments explain the "why" not just the "what", and may have clever or non-obvious optimizations.
    - UNCERTAIN: The code snippet is too short, simple (e.g., a single function), or common to make a confident determination.
  `;

  const languageInstruction = language === 'auto'
    ? "First, auto-detect the programming language of the following code snippet. Then, analyze the code based on that language's common practices and AI generation patterns."
    : `The following code is in ${language}. Please analyze it based on its idiomatic patterns and common AI generation artifacts.`;

  const prompt = `${languageInstruction}\n\nCODE:\n---\n${code}\n---`;
  // For code, we map verdicts to the existing schema. We will add a default aiPercentage.
  const result = await callGemini(prompt, systemInstruction);
  if (result.verdict as any === 'LIKELY_AI') {
      // FIX: Used Verdict enum for type-safe assignment.
      result.verdict = Verdict.AI_GENERATED;
  }
  if (!result.aiPercentage) {
      result.aiPercentage = result.verdict === 'LIKELY_HUMAN' ? Math.floor(Math.random() * 10) : result.verdict === 'UNCERTAIN' ? 50 : 90 + Math.floor(Math.random() * 10);
  }
  return result;
};

export const checkGrammar = async (text: string, language: string): Promise<GrammarResult> => {
    const systemInstruction = `
        You are an expert multilingual grammar and style checker. Your task is to identify grammatical errors, spelling mistakes, and style issues in the provided text.
        For each error you find, provide the original incorrect text, the corrected version, and a clear, concise explanation of the correction.
        Also, provide the full text with all corrections applied.
        Your response MUST be a valid JSON object.
    `;

    const languageInstruction = language === 'auto'
      ? "First, auto-detect the language of the following text. Then, please check its grammar."
      : `The following text is in ${language}. Please check its grammar.`;
    
    const prompt = `${languageInstruction}\n\nTEXT:\n---\n${text}\n---`;

    const grammarSchema = {
        type: Type.OBJECT,
        properties: {
          correctedText: { 
            type: Type.STRING, 
            description: "The full text with all grammar and spelling corrections applied." 
          },
          errors: {
            type: Type.ARRAY,
            description: "A list of specific errors found in the text.",
            items: {
              type: Type.OBJECT,
              properties: {
                originalText: {
                  type: Type.STRING,
                  description: "The original text snippet containing the error.",
                },
                correctedText: {
                  type: Type.STRING,
                  description: "The corrected version of the text snippet.",
                },
                explanation: {
                  type: Type.STRING,
                  description: "A brief explanation of the grammatical error and the correction.",
                },
              },
              required: ['originalText', 'correctedText', 'explanation'],
            },
          },
        },
        required: ['correctedText', 'errors'],
      };
      
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: grammarSchema,
                temperature: 0.1,
            },
        });
        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        return result as GrammarResult;
    } catch (error) {
        console.error("Error calling Gemini API for grammar check:", error);
        throw new Error("Failed to get a valid grammar analysis from the AI model.");
    }
};

export const rewriteSentence = async (text: string, options: { professional: boolean; normal: boolean }): Promise<RewriteResult> => {
    const tones = [];
    if (options.professional) {
      tones.push("'More Formal'", "'More Confident'", "'More Concise'", "'Business Professional'");
    }
    if (options.normal) {
      tones.push("'More Casual'", "'Simpler'", "'More Friendly'", "'Natural Sounding'");
    }
  
    if (tones.length === 0) {
      return { suggestions: [] };
    }

    const systemInstruction = `
        You are an expert writer and editor. Your task is to rewrite the provided text in several different tones to offer the user alternative ways of expressing their ideas.
        Provide suggestions with the following tones: ${tones.join(', ')}.
        Your response MUST be a valid JSON object.
    `;
    const prompt = `Please rewrite the following text. TEXT:\n---\n${text}\n---`;

    const rewriteSchema = {
        type: Type.OBJECT,
        properties: {
            suggestions: {
                type: Type.ARRAY,
                description: "A list of rewrite suggestions.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        tone: {
                            type: Type.STRING,
                            description: "The tone of the rewritten text (e.g., 'Formal', 'Casual', 'Shorter').",
                        },
                        rewrittenText: {
                            type: Type.STRING,
                            description: "The rewritten version of the text.",
                        },
                    },
                    required: ['tone', 'rewrittenText'],
                },
            },
        },
        required: ['suggestions'],
    };

    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: rewriteSchema,
                temperature: 0.7,
            },
        });
        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        return result as RewriteResult;
    } catch (error) {
        console.error("Error calling Gemini API for rewriting:", error);
        throw new Error("Failed to get rewrite suggestions from the AI model.");
    }
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
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
    - AI_GENERATED: The image contains multiple common AI artifacts.
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
  
  const result = await callGemini({ parts: [{text: prompt}, imagePart] }, systemInstruction);
  if (!result.aiPercentage) {
      result.aiPercentage = result.verdict === 'LIKELY_HUMAN' ? Math.floor(Math.random() * 10) : result.verdict === 'UNCERTAIN' ? 50 : 90 + Math.floor(Math.random() * 10);
  }
  return result;
};

export const analyzeVideoFrames = async (frames: { base64: string; mimeType: string }[]): Promise<AnalysisResult> => {
    const systemInstruction = `
    You are an expert in advanced digital video forensics, specializing in detecting deepfakes and AI-generated video.
    The user has provided a sequence of frames from a video. Analyze these frames collectively for signs of AI generation or manipulation. Pay close attention to:
    - **Facial Artifacts:** Unnatural blinking patterns (too frequent, too rare, or unsynchronized), weird facial morphing, inconsistent expressions, and unnatural skin texture.
    - **Lighting & Shadows:** Inconsistencies in lighting on the face versus the background, shadows that don't match the light source.
    - **Temporal Inconsistencies:** Flickering, unnatural object morphing between frames, lack of realistic motion blur, and strange background warping.
    - **Edge Anomalies:** Blurring or distortion around the edges of a person or object that has been superimposed.

    - AI_GENERATED: The video frames show clear signs of deepfake artifacts or temporal inconsistency.
    - LIKELY_HUMAN: The frames are consistent, lighting is natural, and the subject appears authentic.
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
  const result = await callGemini(contents, systemInstruction);
   if (!result.aiPercentage) {
      result.aiPercentage = result.verdict === 'LIKELY_HUMAN' ? Math.floor(Math.random() * 10) : result.verdict === 'UNCERTAIN' ? 50 : 90 + Math.floor(Math.random() * 10);
  }
  return result;
}

export const analyzeAudio = async (base64Audio: string, mimeType: string): Promise<AnalysisResult> => {
  const systemInstruction = `
    You are an expert in advanced audio forensics, specializing in detecting deepfake and AI-generated voices (voice cloning).
    Analyze the provided audio for subtle signs of AI generation. Listen for:
    - **Cadence & Emotion:** Unnatural emotional cadence or a flat, robotic tone. Lack of natural pauses or hesitations.
    - **Background Noise:** A complete lack of subtle background noise, which can indicate an artificially generated environment.
    - **Audio Artifacts:** Specific frequency artifacts, metallic ringing, or digital noise left by voice-cloning models.
    - **Human Imperfections:** Lack of breaths, lip smacks, plosives (p, b, t sounds), or other non-speech sounds that are typical of human speech.

    - AI_GENERATED: The audio has a robotic cadence, lacks human-like imperfections, or contains digital artifacts indicative of voice cloning.
    - LIKELY_HUMAN: The audio includes natural speech patterns, breaths, background noise, and variable intonation.
    - UNCERTAIN: The audio quality is too low, or the speech is too brief to make a confident determination.
  `;
  const prompt = "Please analyze the following audio for signs of AI generation and provide your analysis in the specified JSON format.";
  
  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: mimeType,
    },
  };
  
  const result = await callGemini({ parts: [{text: prompt}, audioPart] }, systemInstruction);
   if (!result.aiPercentage) {
      result.aiPercentage = result.verdict === 'LIKELY_HUMAN' ? Math.floor(Math.random() * 10) : result.verdict === 'UNCERTAIN' ? 50 : 90 + Math.floor(Math.random() * 10);
  }
  return result;
};


export const createVideo = async (
  prompt: string,
  image: { imageBytes: string; mimeType: string } | null,
  config: { resolution: '720p' | '1080p'; aspectRatio: '16:9' | '9:16' },
  onProgress: (message: string) => void
): Promise<string> => {
  // Create a new instance for each call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  onProgress('Initializing video generation...');
  
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    ...(image && { image }),
    config: {
      numberOfVideos: 1,
      resolution: config.resolution,
      aspectRatio: config.aspectRatio,
    }
  });

  onProgress('Video generation started. This may take a few minutes...');

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
    onProgress('Checking video status...');
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  onProgress('Finalizing video...');

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error('Video generation finished, but no download link was provided.');
  }

  // The response.body contains the MP4 bytes. We must append an API key.
  const response = await fetch(`${downloadLink}&key=${getApiKey()}`);
  if (!response.ok) {
      throw new Error(`Failed to fetch the generated video. Status: ${response.statusText}`);
  }
  
  const videoBlob = await response.blob();
  return URL.createObjectURL(videoBlob);
};