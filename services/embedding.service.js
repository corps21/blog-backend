import { tryCatchWrapper } from "../utils";

const MODEL = "models/gemini-embedding-001"
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent"

class EmbeddingService {
    constructor(model, apiKey, baseUrl) {
        this.model = model
        this.apiKey = apiKey
        this.baseUrl = baseUrl
    }

    getEmbedding = tryCatchWrapper(async (text) => {
        const headers = {
            "Content-Type": "application/json",
			"x-goog-api-key": this.apiKey,
        }

        const body = JSON.stringify({
            model: this.model,
            content: {
                parts: [{text}]
            }
        })

        const embeddingResponse = await fetch(this.baseUrl, {
            headers,
            body
        })
        const embeddingData = await embeddingResponse.json()
        return embeddingData
    })
}

export const embeddingService = new EmbeddingService(MODEL, process.env.GEMINI_API_KEY, BASE_URL)