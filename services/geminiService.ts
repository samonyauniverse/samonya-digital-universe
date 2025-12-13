
import { GoogleGenAI, Type } from "@google/genai";

// Use gemini-2.5-flash as the standard model for speed and efficiency
const STANDARD_MODEL = 'gemini-2.5-flash';

// Helper to get brand specific constraints
const getBrandConstraints = (brandId: string) => {
    switch (brandId) {
        case 'milele': return "ROLE: Spiritual Guide. GOAL: Reveal biblical truths, gospel mysteries, and faith. TONE: Reverent, deep, insightful. BOUNDARY: REJECT secular, political, or celebrity gossip topics unless viewed through a strictly spiritual lens.";
        case 'kids': return "ROLE: Kindergarten Teacher. GOAL: Educate and entertain children. TONE: Cheerful, simple, safe, fun. BOUNDARY: STRICTLY NO violence, scary themes, adult content, or complex politics.";
        case 'sky': return "ROLE: Entertainment Reporter. GOAL: Discuss trends, celebrities, music, and pop culture. TONE: Trendy, buzz-worthy, casual, exciting. BOUNDARY: Focus on pop culture and lifestyle.";
        case 'tv': return "ROLE: Investigative Journalist. GOAL: Report facts, history, news, and science documentaries. TONE: Professional, objective, informative. BOUNDARY: Focus on reality, history, and documentation.";
        case 'films': return "ROLE: Creative Screenwriter. GOAL: Tell compelling fictional stories (Romance, Action, Thriller). TONE: Dramatic, cinematic, engaging. BOUNDARY: Must be narrative fiction or movie related.";
        case 'motivation': return "ROLE: Life Coach. GOAL: Inspire resilience, success, and mental strength. TONE: Uplifting, powerful, encouraging. BOUNDARY: Focus on self-improvement.";
        case 'dream_eye': return "ROLE: Dream Interpreter. GOAL: Decode subconscious symbols and sleep science. TONE: Mystical, psychological, calm. BOUNDARY: Focus on dreams and the mind.";
        case 'comedy': return "ROLE: Stand-up Comedian. GOAL: Make people laugh. TONE: Humorous, satirical, light-hearted. BOUNDARY: Entertainment and laughter.";
        case 'samonya_ai': return "ROLE: Tech Futurist. GOAL: Explaining AI and future technology. TONE: Intelligent, visionary. BOUNDARY: Technology focus.";
        case 'academy': return "ROLE: Professor. GOAL: Academic research and education. TONE: Scholarly, detailed. BOUNDARY: Education and facts.";
        case 'business_matrix': return "ROLE: Senior Business Consultant. GOAL: Provide expert business advice, strategy, and documentation. TONE: Professional, strategic, actionable. BOUNDARY: Focus on business, finance, and legal drafting.";
        default: return `ROLE: Expert for ${brandId}. GOAL: Create content relevant to ${brandId}. BOUNDARY: Stay within the niche of ${brandId}.`;
    }
};

export const generateSeoData = async (title: string, context: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Generate SEO metadata for a content item on 'SAMONYA DIGITAL UNIVERSE'.
    Content Title: "${title}"
    Context: "${context}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: STANDARD_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Max 160 chars SEO description" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 relevant tags" }
          },
          required: ["description", "tags"]
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { description: "Content on Samonya Digital Universe", tags: ["Samonya", "AI"] };
  }
};

export const generateArticleMetadata = async (topic: string, brandId: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const brandRules = getBrandConstraints(brandId);

  const prompt = `
    Generate metadata for a NEW article for brand "${brandId}" on topic: "${topic}".
    
    BRAND RULES & BOUNDARIES (MUST FOLLOW):
    ${brandRules}
    
    INSTRUCTION:
    1. Check if the topic "${topic}" fits the Brand Boundaries above.
    2. If it fits, proceed.
    3. If it DOES NOT fit (e.g., "War" for "Kids", or "Gossip" for "Milele"), you MUST creative ADAPT the topic to fit the brand's goal.
       - Example (Kids): "War" -> "How to Make Peace with Friends".
       - Example (Milele): "Celebrity Scandal" -> "Praying for Leaders".
    
    Return JSON:
    1. title: Click-worthy, strictly aligned with brand.
    2. description: Short summary aligned with brand tone.
    3. tags: 5 relevant tags.
    4. thumbnailPrompt: Image generation prompt for the cover.
  `;

  try {
    const response = await ai.models.generateContent({
      model: STANDARD_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            thumbnailPrompt: { type: Type.STRING }
          },
          required: ["title", "description", "tags", "thumbnailPrompt"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Metadata Error:", error);
    return {
      title: topic,
      description: `An AI generated article about ${topic}.`,
      tags: ['AI', 'Generated'],
      thumbnailPrompt: 'Abstract digital art high quality'
    };
  }
};

export const generateLongFormArticle = async (title: string, brandId: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const brandRules = getBrandConstraints(brandId);
    
    const prompt = `
      Write a COMPREHENSIVE article about: "${title}".
      
      STRICT BRAND GUIDELINES:
      ${brandRules}
      
      CRITICAL INSTRUCTION:
      Ensure the content is 100% aligned with the brand's goal and purpose defined above. 
      If the title suggests something off-brand, you must PIVOT the content to align with the brand's values immediately.
      (e.g., If writing for 'Kids', do not use complex words or scary concepts. If 'Milele', keep it spiritual).
      
      MANDATORY FORMATTING:
      1. Start with a visual tag: [VISUAL: detailed description of main header scene].
      2. Use Markdown formatting (H2, H3, Bold).
      3. Every 3 paragraphs, insert a visual tag: [VISUAL: description of scene].
      4. Length: Long form, engaging.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STANDARD_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Article Gen Error:", error);
        return "## Error\n\nContent generation failed. Please try again.";
    }
};

export const translateText = async (text: string, targetLanguage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Translate the following Markdown content to ${targetLanguage}.
    
    RULES:
    1. KEEP [VISUAL: ...] tags EXACTLY as they are in English. Do not translate them.
    2. Maintain all Markdown formatting.
    3. Adapt tone to target language culture if possible.
    
    Content:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: STANDARD_MODEL,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Translation Error:", error);
    return null;
  }
};

export const generateMotivationalQuote = async (topic: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Generate a powerful, unique motivational quote about "${topic}". Return JSON {quote, author}.`;

  try {
    const response = await ai.models.generateContent({
      model: STANDARD_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { quote: { type: Type.STRING }, author: { type: Type.STRING } },
          required: ["quote", "author"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { quote: "Keep going.", author: "Samonya" };
  }
};

export const generateHolyScripture = async (topic: string = 'Guidance') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Generate a powerful, spiritually uplifting scripture or quote from the Bible (or Quran/Torah if specifically requested in topic, default to Bible) regarding: "${topic}".
    
    It should be accurate and impactful.
    
    Return JSON:
    {
      "text": "The actual verse text.",
      "reference": "The Book Chapter:Verse (e.g. Isaiah 40:31)",
      "insight": "A short, powerful application of this verse for today."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: STANDARD_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            reference: { type: Type.STRING },
            insight: { type: Type.STRING }
          },
          required: ["text", "reference", "insight"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Scripture Gen Error:", error);
    return null;
  }
};

// --- DREAM EYE 2.0 UPDATE ---
export const generateDreamAnalysis = async (dreamText: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are SAMONYA DREAM EYE 2.0, an advanced dream interpretation intelligence.
    
    Mission:
    - Decode dreams with emotional, psychological, spiritual, and symbolic precision.
    - Provide personalized insights based on tone.
    - Identify dream archetypes.
    - Detect subconscious themes.
    - Provide actionable advice.
    - Offer predictive pathways.
    - Visualize the dream world using immersive cosmic metaphors.
    
    Tone: Mystical but clear, deep but friendly, wise but non-judgmental.

    Dream to analyze: "${dreamText}"

    Output JSON structure based on this analysis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: STANDARD_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Clear, short explanation of the dream." },
            symbols: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: {
                        name: { type: Type.STRING },
                        meaning: { type: Type.STRING, description: "What it represents specifically for this dreamer." }
                    }
                } 
            },
            emotions: {
                type: Type.OBJECT,
                properties: {
                    fear: { type: Type.INTEGER, description: "Score 0-100" },
                    hope: { type: Type.INTEGER, description: "Score 0-100" },
                    stress: { type: Type.INTEGER, description: "Score 0-100" },
                    transformation: { type: Type.INTEGER, description: "Score 0-100" },
                    intuition: { type: Type.INTEGER, description: "Score 0-100" },
                },
                required: ["fear", "hope", "stress", "transformation", "intuition"]
            },
            archetype: { type: Type.STRING, description: "One of: The Messenger, The Transformation, The Shadow, The Journey, The Test, The Future Self, The Inner Child, The Doorway" },
            archetypeReason: { type: Type.STRING },
            subconsciousMeaning: { type: Type.STRING, description: "Reveals mindset, fears, desires, hidden strengths." },
            lifeApplication: { type: Type.STRING, description: "Actionable advice." },
            dreamUniverseVisual: { type: Type.STRING, description: "Cinematic, cosmic description of the dream realm." },
            futureInsight: { type: Type.STRING, description: "Possible future pathways or emotional outcomes." },
            visualPrompt: { type: Type.STRING, description: "A detailed prompt to generate an image of this dream." }
          },
          required: ["summary", "symbols", "emotions", "archetype", "archetypeReason", "subconsciousMeaning", "lifeApplication", "dreamUniverseVisual", "futureInsight", "visualPrompt"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Dream Analysis Error", error);
    return null;
  }
};

export const generateSongLyrics = async (genre: string, style: string, mood: string, topic: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a professional songwriter and music producer.
    Task: Write full song lyrics and define the musical style.
    
    Parameters:
    - Genre: ${genre}
    - Style/Vibe: ${style}
    - Mood: ${mood}
    - Topic: ${topic}

    Returns JSON:
    1. title: Creative song title.
    2. lyrics: Full lyrics formatted with [Verse], [Chorus], [Bridge], [Outro].
    3. styleGuide: A detailed paragraph describing the beat, instrumentation, tempo, and vocal delivery style to guide a producer.
    4. coverPrompt: Visual description for album art.
  `;

  try {
    const response = await ai.models.generateContent({
      model: STANDARD_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            styleGuide: { type: Type.STRING },
            coverPrompt: { type: Type.STRING }
          },
          required: ["title", "lyrics", "styleGuide", "coverPrompt"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Lyrics Gen Error:", error);
    return null;
  }
};

export const chatWithSamonyaAI = async (
  message: string, 
  imagePart: { mimeType: string; data: string } | null,
  history: {role: string, parts: {text: string}[]}[] = [],
  mode: 'chat' | 'code' | 'strategy' = 'chat'
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let systemPrompt = "";

  if (mode === 'code') {
      systemPrompt = `
        You are Samonya AI (Mode: Advanced Coding & Database Expert).
        Identity: Senior Software Architect and Database Administrator.
        Mission: Generate, debug, and optimize complex codebases and databases.
        Tone: Technical, precise, efficient, yet helpful.
        Capabilities: 
        - Write clean, production-ready code in any language.
        - Optimize SQL queries and database schemas.
        - Debug errors with explanation.
        - Provide architectural advice.
        Rules: Use code blocks for all code. Explain logic clearly.
      `;
  } else if (mode === 'strategy') {
      systemPrompt = `
        You are Samonya AI (Mode: Strategic Analyst).
        Identity: High-level Strategic Consultant and Planner.
        Mission: Break down complex problems and formulate actionable plans.
        Tone: Professional, analytical, structured, visionary.
        Capabilities:
        - SWOT Analysis.
        - Step-by-step action plans.
        - Risk assessment and mitigation.
        - Business and life strategy optimization.
        Rules: Structure responses with clear headings, bullet points, and actionable steps.
      `;
  } else {
      // Default Natural Chat
      systemPrompt = `
        You are Samonya AI (Version 6.0).
        Identity: A next-generation, hyper-intelligent personal assistant.
        Personality: Smart, reliable, futuristic, friendly, and intuitive.
        Capabilities: General conversation, creative writing, advice, analysis.
        Rules:
        1. Engage in human-like conversation with deep context awareness.
        2. Remember user preferences within the session.
        3. If user asks for image/drawing, output tag: [IMAGE: detailed description].
        4. Tone: Clear, trustworthy, expertly written, with a futuristic edge.
      `;
  }

  try {
    const chat = ai.chats.create({
      model: STANDARD_MODEL,
      config: { systemInstruction: systemPrompt },
      history: history
    });

    let msgParts: any[] = [{ text: message }];
    if (imagePart) {
      msgParts.push({ inlineData: { mimeType: imagePart.mimeType, data: imagePart.data } });
    }

    const result = await chat.sendMessage({ message: msgParts });
    return result.text;
  } catch (error) {
    console.error(error);
    return "Connection interrupted.";
  }
};

export const consultAcademy = async (topic: string, mode: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Config specifically for academy tasks
    let role = "Academic Researcher";
    let instructions = "Provide deep, structured analysis.";

    if (mode === 'quick') { role = "Knowledge Engine"; instructions = "Concise summary, bullet points, fast facts."; }
    else if (mode.startsWith('math')) { 
        role = "Math Professor"; 
        instructions = mode.includes('concise') ? "Show workouts only. No fluff. LaTeX format." : "Explain step-by-step with concepts."; 
    }
    else if (mode === 'book') { role = "Librarian"; instructions = "Condense book into key takeaways and actionable insights."; }
    else if (mode === 'study') { role = "Tutor"; instructions = "Create flashcards and quiz questions from topic."; }
    else if (mode === 'invite') { role = "Designer"; instructions = "Draft invitation text and provide [VISUAL: ...] tag for card design."; }
    else if (mode === 'brand') { role = "Analyst"; instructions = "Simulate brand sentiment analysis and visibility score."; }

    const prompt = `
        Role: ${role}.
        Task: ${topic}.
        Instructions: ${instructions}.
        Format: Markdown. Use Bold for key terms.
        End with [RELATED: Topic1 | Topic2].
    `;

    try {
        const response = await ai.models.generateContent({
            model: STANDARD_MODEL,
            contents: prompt
        });
        return response.text;
    } catch (error) {
        return "Academy Archive Unavailable.";
    }
};

export const generateImage = async (prompt: string, imageBase64?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];
  if (imageBase64) {
     const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
     if (match) {
         parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
     }
  }
  parts.push({ text: prompt });

  try {
    // The gemini-2.5-flash-image model supports generateContent for images
    // Wrapping contents in an array for better compatibility with strict types
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts }]
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

export const generateVideoConcept = async (topic: string, brandId: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const brandRules = getBrandConstraints(brandId);

  const prompt = `
    Create a video production plan for a video about "${topic}".
    Brand Context: ${brandId}.
    
    STRICT BRAND ALIGNMENT:
    ${brandRules}
    
    INSTRUCTION: Ensure the script, visual style, and audio are perfectly suited for the "${brandId}" audience and goals.
    
    Output JSON with:
    - title
    - description
    - script (voiceover or dialogue)
    - scenes (array of objects with time, visual, audio)
  `;

  try {
    const response = await ai.models.generateContent({
      model: STANDARD_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            script: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  visual: { type: Type.STRING },
                  audio: { type: Type.STRING }
                },
                required: ["time", "visual", "audio"]
              }
            }
          },
          required: ["title", "description", "script", "scenes"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Video Concept Error:", error);
    return null;
  }
};

// --- BUSINESS MATRIX TOOLS ---
export const generateBusinessTool = async (
    tool: 'plan' | 'deck' | 'brand' | 'profit' | 'legal' | 'hr', 
    inputs: any
) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt = "";
    let systemRole = "You are an expert Business Consultant AI for Samonya Business Matrix.";

    switch(tool) {
        case 'plan':
            prompt = `Generate a comprehensive Business Plan for a ${inputs.industry} business.
            Target Audience: ${inputs.audience}. Budget: ${inputs.budget}. Goals: ${inputs.goals}.
            
            Structure (in Markdown):
            1. Executive Summary
            2. Market Analysis (Trends & Competitors)
            3. SWOT Analysis (Table)
            4. Marketing Strategy
            5. 12-Month Action Roadmap (Month by Month)
            `;
            break;
        case 'deck':
            prompt = `Create a Startup Pitch Deck outline for a company seeking ${inputs.funding} in funding.
            Business Description: ${inputs.description}.
            
            Structure (Slide by Slide content):
            1. Problem & Solution
            2. Market Size (TAM/SAM/SOM estimates based on typical ${inputs.industry} data)
            3. Business Model
            4. Go-to-Market Strategy
            5. Financial Projections (3 Years)
            6. Ask & Use of Funds
            `;
            break;
        case 'brand':
            prompt = `Generate a Branding Identity Kit for a business in ${inputs.industry}.
            Name Idea (optional): ${inputs.name}. Vibe: ${inputs.vibe}.
            
            Output JSON:
            {
                "names": ["Name 1", "Name 2", "Name 3"],
                "slogans": ["Slogan 1", "Slogan 2"],
                "colors": [{"hex": "#...", "name": "Deep Blue"}, ...],
                "logoStyle": "Description of logo style...",
                "fontPairing": "Header Font & Body Font suggestions"
            }
            `;
            break;
        case 'profit':
            prompt = `Perform a Profit Analysis.
            Business Type: ${inputs.type}.
            Monthly Fixed Costs: ${inputs.fixedCost}.
            Avg Cost per Unit: ${inputs.varCost}.
            Avg Price per Unit: ${inputs.price}.
            
            Calculate:
            1. Break-even point (units).
            2. Projected Profit at 100, 500, and 1000 units/sales.
            3. Provide 3 specific ways to increase margins for this business type.
            Format as clear Markdown.
            `;
            break;
        case 'legal':
            prompt = `Draft a LEGAL DOCUMENT TEMPLATE.
            Type: ${inputs.docType}.
            Party A: ${inputs.partyA}.
            Party B: ${inputs.partyB}.
            Key Terms: ${inputs.terms}.
            
            DISCLAIMER: State clearly at the top that this is AI generated and not professional legal advice.
            Format: Standard legal contract structure with clauses.
            `;
            break;
        case 'hr':
            prompt = `Generate HR Content for a role: ${inputs.role}.
            Level: ${inputs.level}.
            
            Provide:
            1. Detailed Job Description.
            2. Key Responsibilities.
            3. Required Skills.
            4. Estimated Salary Range (Global Average).
            5. Interview Questions (3 Technical, 3 Behavioral).
            `;
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model: STANDARD_MODEL,
            contents: prompt,
            config: {
                // Only enforce JSON schema for specific tools that need structured data parsing
                responseMimeType: tool === 'brand' ? "application/json" : "text/plain"
            }
        });
        
        if (tool === 'brand') {
            return JSON.parse(response.text || '{}');
        }
        return response.text;
    } catch (error) {
        console.error("Business Tool Error:", error);
        return "Analysis failed. Please try again.";
    }
};
