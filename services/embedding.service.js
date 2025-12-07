import { pipeline } from "@xenova/transformers";
import { tryCatchWrapper } from "../utils/index.js";

class EmbeddingService {
	getEmbedding = tryCatchWrapper(async (text) => {
		const embedder = await pipeline(
			"feature-extraction",
			"Xenova/nomic-embed-text-v1",
		);

		const results = await embedder(text, { pooling: "mean", normalize: true });
		return Array.from(results.data);
	});
}

export const embeddingService = new EmbeddingService();
