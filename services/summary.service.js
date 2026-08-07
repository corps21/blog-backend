import { pipeline } from "@huggingface/transformers";
import { tryCatchWrapper } from "../utils/index.js";

class SummaryService {
	getSummary = tryCatchWrapper(async (text) => {
		const summarizer = await pipeline(
			"summarization",
			"Xenova/distilbart-cnn-6-6",
			{ dtype: "q8", cpu: true },
		);

		const summaryData = await summarizer(text, {
			max_length: 500,
			min_new_tokens: 150,
		});

		return summaryData;
	});
}

export const summaryService = new SummaryService();
