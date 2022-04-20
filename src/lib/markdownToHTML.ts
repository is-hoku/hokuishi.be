import { remark } from "remark";
import html from "remark-html";
import highlight from "rehype-highlight";
import math from "remark-math";
import katex from "rehype-katex";
import raw from "rehype-raw";
import remark2rehype from "remark-rehype";

const markdownToHTML = async (markdown: string) => {
	const result = await remark()
		.use(html)
		.use(math)
		//.use(remark2rehype, { allowDangerousHtml: true })
		//.use(raw)
		.use(highlight)
		.use(katex)
		.process(markdown);
	return result.toString();
};

export default markdownToHTML;
