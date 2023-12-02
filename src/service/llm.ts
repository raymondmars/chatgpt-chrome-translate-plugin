
export interface LLM {
  name: string
  model: string
  prompt: string
  temperature: number
  apikey: string
  baseUrl?: string
  customHeaders: Record<string, string>
  makeCompletion: (text: string) => Promise<string>
}