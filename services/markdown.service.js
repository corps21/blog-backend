import TurndownService from "turndown";

class MarkdownService {
	turndownService;

	constructor() {
		this.turndownService = new TurndownService();
	}

	convert = async (text) => {
		return this.turndownService.turndown(text);
	};
}

export const markdownService = new MarkdownService();
