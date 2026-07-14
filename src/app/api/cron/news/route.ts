import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getMarketNews as getYahooNews } from "@/lib/yahoo-finance";
import { getMarketNews as getFinnhubNews } from "@/lib/finnhub";
import { getMarketNews as getPolygonNews } from "@/lib/polygon";
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

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Fetch latest news from Yahoo Finance, Finnhub, and Polygon
    const [yahooResult, finnhubResult, polygonResult] = await Promise.all([
      getYahooNews(),
      getFinnhubNews(),
      getPolygonNews(),
    ]);

    // Map Finnhub results to match the same structure
    const mappedFinnhub = (finnhubResult || []).map((item: any) => ({
      id: String(item.id),
      url: item.url,
      image: item.image || null,
      source: item.source,
      datetime: item.datetime, // Finnhub is in seconds
      headline: item.headline,
      summary: item.summary || "",
      relatedTickers: item.related ? item.related.split(",") : [],
    }));

    // Map Polygon results
    const mappedPolygon = (polygonResult || []).map((item: any) => ({
      id: String(item.id),
      url: item.article_url,
      image: item.image_url || null,
      source: item.publisher?.name || "Polygon",
      datetime: new Date(item.published_utc).getTime() / 1000, // Convert string date to seconds
      headline: item.title,
      summary: item.description || "",
      relatedTickers: item.tickers || [],
    }));

    // Combine and sort by datetime descending
    const allNews = [...(yahooResult || []), ...mappedFinnhub, ...mappedPolygon].sort((a, b) => b.datetime - a.datetime);

    if (allNews.length === 0) {
      return NextResponse.json({ message: "No news found from sources." });
    }

    // Limit to top 20 news items to prevent overload, user wants 50 on screen but cron can process batches
    const latestNews = allNews.slice(0, 20);

    for (const item of latestNews) {
      // Check if it already exists in DB
      const existing = await prisma.news.findUnique({
        where: { originalId: item.id },
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

        Haber Başlığı: ${item.headline}
        Orijinal Link: ${item.url}
        
        (Not: Eğer haber genel piyasa hakkında ise ve bariz bir yükseliş veya düşüş yönü belirtmiyorsa "Neutral" olarak işaretle.)
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(responseText);

        await prisma.news.create({
          data: {
            originalId: item.id,
            headline: aiData.headline || item.headline,
            summary: aiData.summary || "Özet oluşturulamadı.",
            url: item.url,
            image: item.image || null,
            source: item.source,
            datetime: new Date(item.datetime * 1000), // datetime was in seconds
            sentiment: aiData.sentiment || "Neutral",
            relatedTickers: item.relatedTickers || [],
          },
        });
      } catch (aiError) {
        console.error("AI Processing Error for item:", item.id, aiError);
        // Fallback to storing English if AI fails, so we don't infinitely retry the same item
        await prisma.news.create({
          data: {
            originalId: item.id,
            headline: item.headline,
            summary: "Metin analiz edilemedi.",
            url: item.url,
            image: item.image || null,
            source: item.source,
            datetime: new Date(item.datetime * 1000),
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
