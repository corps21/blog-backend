import tryCatchWrapper from "../utils/tryCatchWrapper.js";

const BASE_URL =
	"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "models/gemini-3.1-flash-lite";
const SYSTEM_INSTRUCTION = {
	parts: [
		{
			text: `
				Summarize the following blog post.

				Return only a concise summary of the blog's content in 2-4 sentences.

				Requirements:
				- Capture the main topic, key ideas, and important conclusions.
				- Keep the summary atleast 100 words long
				- Preserve important technical terms, facts, and concepts.
				- Do not add information that is not present in the blog.
				- Do not provide opinions, analysis, or commentary.
				- Do not mention the summarization process.
				- Do not include a title, heading, "TL;DR", or any other meta information.
				- Return plain text only.

				Blog:
				`,
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
		return summaryData.candidates[0].content.parts[0].text;
	});
}

export const summaryService = new SummaryService(
	BASE_URL,
	API_KEY,
	MODEL,
	SYSTEM_INSTRUCTION,
);
