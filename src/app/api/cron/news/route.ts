import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import yahooFinance from "yahoo-finance2";
import prisma from "@/lib/prisma";

// Add your GEMINI_API_KEY to .env file on the VPS
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const maxDuration = 300; // Allows up to 5 mins if running on Vercel, ignored on standalone Node.js

export async function GET(request: Request) {
  // Simple cron protection (optional: check authorization header or cron secret)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // We only enforce secret if it's set in the environment
    // return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch latest news from Yahoo Finance
    const searchResult = await yahooFinance.search('markets');
    if (!searchResult.news || searchResult.news.length === 0) {
      return NextResponse.json({ message: "No news found from source." });
    }

    // Limit to top 10 news items to prevent overload
    const latestNews = searchResult.news.slice(0, 10);
    const processedCount = 0;

    for (const item of latestNews) {
      // Check if it already exists in DB
      const existing = await prisma.news.findUnique({
        where: { originalId: item.uuid },
      });

      if (existing) continue; // Skip if already processed

      // It's a new news item, let's process it with Gemini
      const prompt = `
        Sen profesyonel bir finansal analistsin. Aşağıdaki İngilizce borsa haberini oku ve benden istenilen formatta geçerli bir JSON olarak yanıt dön. 
        Asla markdown blokları (\`\`\`json) ekleme, sadece pür JSON metnini gönder.
        
        İstenilen JSON yapısı:
        {
          "headline": "Haberin Türkçe çevrilmiş etkileyici başlığı",
          "summary": "Haberin yatırımcılar için 2 cümlelik, kolay anlaşılan Türkçe özeti",
          "sentiment": "Bullish", "Bearish" veya "Neutral" (İlgili hisseler veya genel piyasa için haberin duygu analizi)
        }

        Haber Başlığı: ${item.title}
        Orijinal Link: ${item.link}
        
        (Not: Eğer haber genel piyasa hakkında ise ve bariz bir yükseliş veya düşüş yönü belirtmiyorsa "Neutral" olarak işaretle.)
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(responseText);

        await prisma.news.create({
          data: {
            originalId: item.uuid,
            headline: aiData.headline || item.title,
            summary: aiData.summary || "Özet oluşturulamadı.",
            url: item.link,
            image: item.thumbnail?.resolutions?.[0]?.url || null,
            source: item.publisher,
            datetime: new Date(item.providerPublishTime),
            sentiment: aiData.sentiment || "Neutral",
            relatedTickers: item.relatedTickers || [],
          },
        });
      } catch (aiError) {
        console.error("AI Processing Error for item:", item.uuid, aiError);
        // Fallback to storing English if AI fails, so we don't infinitely retry the same item
        await prisma.news.create({
          data: {
            originalId: item.uuid,
            headline: item.title,
            summary: "Metin analiz edilemedi.",
            url: item.link,
            image: item.thumbnail?.resolutions?.[0]?.url || null,
            source: item.publisher,
            datetime: new Date(item.providerPublishTime),
            sentiment: "Neutral",
            relatedTickers: item.relatedTickers || [],
          },
        });
      }
    }

    return NextResponse.json({ message: "Cron job executed successfully." });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
