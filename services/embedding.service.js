import { pipeline } from "@huggingface/transformers";
import { tryCatchWrapper } from "../utils/index.js";

class EmbeddingService {
	getEmbedding = tryCatchWrapper(async (text) => {
		const embedder = await pipeline(
			"feature-extraction",
			"Xenova/all-MiniLM-L6-v2",
			{
				dtype: "q8",
				device: "cpu",
			},
		);
		const results = await embedder(text, { pooling: "mean", normalize: true });
		return Array.from(results.data);
	});
}

export const embeddingService = new EmbeddingService();
