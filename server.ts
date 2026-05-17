import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Chat endpoint for Al-Baraa assistant
app.post("/api/ai/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    const productList = [
      "بن محوج برازيلي (Brazilian Spiced)",
      "بن سادة برازيلي (Brazilian Plain)",
      "بن محوج مخصوص (Premium Spiced)",
      "بن سادة مخصوص (Premium Plain)",
      "بن محوج كولومبي (Colombian Spiced)",
      "بن سادة كولومبي (Colombian Plain)",
      "بن محوج يمني (Yemeni Spiced - ملك القهوة العربية)",
      "بن سادة يمني (Yemeni Plain)",
      "توليفة بن العميد محوج (Al-Ameed Blend)",
      "توليفة بن البراء محوج (Signature Al-Baraa Blend)",
      "بن حبشي محوج (Abyssinian Spiced)",
      "توليفة بن العريس (Al-Arees Blend)",
      "بن أخضر تخسيس (Green Weight Loss)",
      "بن اسبريسو (Espresso Beans)",
      "نسكافيه جولد (Nescafe Gold)",
      "بن البندق (Hazelnut Coffee)",
      "بن فرنساوي (French Coffee)",
      "هوت شوكليت (Hot Chocolate)"
    ].join(", ");

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a helpful and expert coffee assistant for "Bun Al-Baraa" (بن البراء) roastery in Shubra El-Kheima, Cairo.
        Your goal is to help customers choose the best coffee blends, answer questions about coffee preparation, and provide information about the shop.
        
        Available Products: [${productList}]
        Shop Info:
        - Location: Cairo - Shubra El-Kheima.
        - WhatsApp: 01092680036
        - Working Hours: Sat - Thu | 9 AM - 10 PM.
        
        Guidelines:
        - Response MUST be in Arabic unless the user speaks English.
        - Be friendly, professional, and passionate about coffee.
        - If someone asks for a recommendation, ask about their taste (strong, mild, fruity, nutty, etc.).
        - DO NOT use emojis.
        - Keep responses concise and helpful.`,
      },
      history: history || []
    });

    const result = await chat.sendMessage({ message });
    res.json({ text: result.text });
  } catch (error: any) {
    console.error("Gemini Error:", JSON.stringify(error));
    
    let isQuotaExceeded = false;
    if (error.status === 429 || error.code === 429 || error.message?.includes("429") || error.message?.toLowerCase().includes("quota")) {
      isQuotaExceeded = true;
    }

    if (isQuotaExceeded) {
      return res.status(429).json({ 
        error: "Quota exceeded", 
        textAr: "عذراً، تم الوصول للحد الأقصى للطلبات حالياً. يرجى الانتظار دقيقة.",
        textEn: "Quota reached. Please try again in 60 seconds."
      });
    }

    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// Original recommendation endpoint (kept for compatibility)
app.post("/api/ai/recommend", async (req, res) => {
  const { preferences } = req.body;
  try {
    const productList = [
      "بن محوج برازيلي", "بن سادة برازيلي", "بن محوج مخصوص", "بن سادة مخصوص",
      "بن محوج كولومبي", "بن سادة كولومبي", "بن محوج يمني", "بن سادة يمني",
      "توليفة بن العميد", "توليفة بن البراء", "بن حبشي", "توليفة بن العريس",
      "بن أخضر تخسيس", "بن اسبريسو", "نسكافيه جولد", "بن البندق",
      "بن فرنساوي", "هوت شوكليت"
    ].join(", ");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a coffee expert for "Bun Al-Baraa" roastery. 
      Based on these coffee preferences: ${preferences}, recommend from: [${productList}].
      Response MUST be in Arabic, professional, and NO emojis.`,
    });

    res.json({ recommendation: response.text });
  } catch (error: any) {
    res.status(500).json({ error: "Failed" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
