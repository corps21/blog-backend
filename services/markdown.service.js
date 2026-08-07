import TurndownService from "turndown";

class MarkdownService {
	turndownService;

	constructor() {
		this.turndownService = new TurndownService({
			headingStyle: "atx",
			codeBlockStyle: "fenced",
		});

		this.turndownService.remove(["code", "pre", "ul", "li", "table", "img"]);

		this.turndownService.addRule("stripLinksKeepText", {
			filter: ["a"],
			replacement: (content) => content,
		});
	}

	convert = async (text) => {
		return await this.turndownService.turndown(text);
	};
}

export const markdownService = new MarkdownService();
