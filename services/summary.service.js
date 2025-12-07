import { tryCatchWrapper } from "../utils/index.js";

const MODEL = "models/gemini-2.5-flash";
const BASE_URL =
	"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const SYSTEM_INSTRUCTION = {
	parts: [
		{
			text: "You will be given a blog in html, summarize the blog's content, and don't include any other meta information",
		},
	],
};

class SummaryService {
	constructor(baseUrl, apiKey, model, system_instruction) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.model = model;
		this.system_instruction = system_instruction;
	}

	getSummary = tryCatchWrapper(async (text) => {
		const body = JSON.stringify({
			model: this.model,
			system_instruction: this.system_instruction,
			contents: {
				parts: [
					{
						text,
					},
				],
			},
		});

		const headers = {
			"Content-Type": "application/json",
			"x-goog-api-key": this.apiKey,
		};

		const summaryResponse = await fetch(this.baseUrl, {
			method: "POST",
			headers,
			body,
		});
		const summaryData = await summaryResponse.json();
		return summaryData;
	});
}

export const summaryService = new SummaryService(
	BASE_URL,
	process.env.GEMINI_API_KEY,
	MODEL,
	SYSTEM_INSTRUCTION,
);
