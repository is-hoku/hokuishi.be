module.exports = {
	mode: "jit",
	purge: [
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
		"./src/styles/*.css",
	],
	content: [],
	theme: {
		extend: {},
		colors: {
			black: "#3f3740", // background
			red: "#ff87ff",
			green: "#afd7af",
			yellow: "#d7d787",
			blue: "#afd7ff",
			magenta: "#af87d7",
			cyan: "#ffd7ff", // foreground
			white: "#ffffd7",
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
