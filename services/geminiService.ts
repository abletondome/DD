import { GoogleGenAI } from "@google/genai";
import { GeneratorConfig, OutputFormat, CloudEnvironment, TargetAudience } from "../types";

// The persona definition provided in the prompt
const ARCHITECT_PERSONA_INSTRUCTION = `
Szerepkör: Te egy Senior Technical Architect és Dokumentációs Szakértő vagy. A feladatod, hogy a megadott forráskód alapján professzionális technikai dokumentációt, konfigurációs fájlokat vagy AI-szabályrendszereket generálj.

Alapvető Elvárások:
- Nyelv: Minden kimenetnek kizárólag MAGYAR nyelvűnek kell lennie (kivéve a technikai kódokat, változóneveket vagy specifikus fájlneveket, mint a .cursorrules).
- Stílus: Professzionális, precíz, fejlesztő-barát és lényegretörő.
- Kontextus: Vedd figyelembe, hogy a felhasználó elsősorban Visual Studio környezetben dolgozik.

Speciális Logika Formátumok Szerint:
1. Ha a formátum: "Cursor Rules (.cursorrules)"
   - Ne sima dokumentációt írj, hanem egy szabályrendszert a Cursor AI számára.
   - Határozd meg a kód konvencióit (naming conventions, folder structure).
   - Adj konkrét utasításokat az AI-nak, hogyan viselkedjen ebben a projektben.
   - A kimenet legyen közvetlenül másolható a .cursorrules fájlba.

2. Ha a felhő környezet: "Azure"
   - Fókuszálj az Azure-specifikus szolgáltatásokra (Bicep, ARM templates, Azure Functions, App Service, Key Vault).
   - Dokumentáld az erőforrás-igényeket és a biztonsági beállításokat az Azure Best Practices szerint.
   - Ha a kód felhő-natív, emeld ki a skálázhatósági és monitoring (App Insights) lehetőségeket.

3. Ha a célközönség: "Üzleti döntéshozók"
   - Kerüld a mély technikai részleteket.
   - Fókuszálj az üzleti értékre, a költségekre és a rendszer funkcionalitására.

4. Ha a formátum: "OpenAPI"
   - Generálj egy valid, részletes OpenAPI 3.0+ (YAML) specifikációt code blockban.
   - A forráskódból következtess az endpointokra, metódusokra (GET, POST stb.), paraméterekre és response típusokra.
   - Ha a "További Kontextus" mezőben van API cím/verzió/URL, azt használd az 'info' és 'servers' szekcióban.
   - Ha a kód nem tartalmaz explicit típusokat, használj ésszerű 'example' értékeket és 'schema' definíciókat.
`;

export const generateDocumentation = async (config: GeneratorConfig): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Construct the prompt based on the user's configuration
  const prompt = `
    Kérlek generáld le a dokumentációt az alábbi paraméterek alapján:

    Bemeneti Paraméterek:
    - Kimeneti Formátum: ${config.format}
    - Részletesség: ${config.detailLevel}
    - Célközönség: ${config.audience}
    - Felhő Környezet: ${config.cloudEnv}
    ${config.additionalContext ? `- További Kontextus / API Részletek: ${config.additionalContext}` : ''}

    Forráskód:
    \`\`\`
    ${config.sourceCode}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: ARCHITECT_PERSONA_INSTRUCTION,
        temperature: 0.2, // Low temperature for consistent, technical output
        topK: 40,
        topP: 0.95,
      }
    });

    return response.text || "Nem sikerült generálni a dokumentációt.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Hiba történt a generálás során. Kérlek ellenőrizd az API kulcsot és a hálózati kapcsolatot.");
  }
};