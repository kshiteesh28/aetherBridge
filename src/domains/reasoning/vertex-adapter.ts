import { VertexAI } from '@google-cloud/vertexai';

const project = process.env.GOOGLE_CLOUD_PROJECT || 'aetherbridge-dev';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const vertexAI = new VertexAI({ project, location });
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-1.5-pro-preview-0409',
  generationConfig: {
    temperature: 0.1,
    responseMimeType: 'application/json',
  }
});

export class VertexAdapter {
  /**
   * Triggers the multi-modal reasoning engine via Gemini 1.5 Pro.
   */
  static async extractIntent(gcsUri: string, mimeType: string): Promise<any> {
    const prompt = `Analyze this multi-modal intake (it may be voice, photo, or both). Provide an extreme crisis-oriented JSON output bounding the event to "Medical_Emergency", "SOS", or "Infrastructure_Issue". Extract all possible entities. Include patient_name, location, or severity. Keep confidence between 0.0 and 1.0.`;

    const request = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType,
                fileUri: gcsUri,
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    };

    const result = await generativeModel.generateContent(request);
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error("AI returned empty response");
    }

    try {
      return JSON.parse(responseText.trim());
    } catch {
      throw new Error("AI returned invalid JSON");
    }
  }
}
