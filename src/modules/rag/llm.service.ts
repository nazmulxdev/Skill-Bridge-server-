import { config } from "../../config";
import AppError from "../../utils/AppErrors";

export class LLMService {
  private apikey: string;
  private apiurl: string = "https://openrouter.ai/api/v1";
  private model: string;

  constructor() {
    this.apikey = config.openrouter_api_key || "";
    this.model = config.openrouter_llm_model as string;
    if (!this.apikey) throw new AppError(500, "OpenRouter API key is required");
  }

  async generateResponse(prompt: string, context: string[]): Promise<string> {
    try {
      let fullPrompt =
        context.length > 0
          ? `Context information:\n${context.join("\n")}\n\nQuestion: ${prompt}\n\nAnswer based on context. If not found, say "I don't have that information." Be concise and helpful.`
          : prompt;

      const response = await fetch(`${this.apiurl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apikey}`,
          "Content-Type": "application/json",
          "X-Title": "SkillBridge",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are SkillBridge AI assistant. Help with tutors, subjects, booking, pricing.",
            },
            { role: "user", content: fullPrompt },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(response.status, `LLM error: ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error("LLM error:", error);
      throw new AppError(500, "Failed to generate response");
    }
  }
}
