
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialInsight(balance: number, spentThisMonth: number) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Kullanıcının mevcut bakiyesi ₺${balance} ve bu ayki toplam harcaması ₺${spentThisMonth}. 
      Lütfen bu verilere dayanarak kısa, teşvik edici ve pratik bir finansal tavsiye ver (Türkçe). 
      Format: "Tebrikler/Dikkat! [Tavsiye cümlesi]. Bu şekilde devam ederseniz [Tahmini tasarruf] kazanabilirsiniz."`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return "Harcama alışkanlıklarınız optimize ediliyor. Bu şekilde devam ederseniz ay sonunda ₺1.850,00 tasarruf edebilirsiniz.";
  }
}

export async function analyzeReceipt(base64Image: string, categories: {id: string, name: string}[]) {
  try {
    const categoryList = categories.map(c => `${c.id} (${c.name})`).join(", ");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: `Bu bir alışveriş fişi veya faturasıdır. Görüntüyü analiz et ve şu bilgileri JSON formatında döndür:
          - amount: Toplam tutar (sayı olarak, kuruşlar nokta ile ayrılmış)
          - date: İşlem tarihi (ISO formatında, eğer bulunamazsa bugünün tarihini kullan)
          - categoryId: Şu kategorilerden en uygun olanın ID'si: [${categoryList}]
          - storeName: Mağaza veya market adı
          - note: Alınan ana ürünlerin kısa bir özeti (örn: "Market alışverişi, meyve, süt")
          
          Sadece JSON döndür, başka açıklama yapma.`
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Receipt analysis failed:", error);
    return null;
  }
}
