import axios from 'axios';
import { CONFIG } from '../utils/config';

export class LMStudioClient {
  private apiUrl: string;

  constructor() {
    this.apiUrl = CONFIG.LM_STUDIO_API_URL;
  }

  async getModelResponse(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
            "model": CONFIG.MODEL_NAME,
            "messages": [ 
              { "role": "user", "content": prompt }
            ], 
            "temperature": 0.2,  // Higher temperature => more random and lower temperature => exact match
            "max_tokens": -1
          }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error fetching model response:", error);
      return "";
    }
  }
}
