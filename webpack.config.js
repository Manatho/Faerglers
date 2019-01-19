const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");

const commonConfig = {
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].js"
	},
	node: {
		__dirname: false
	},
	module: {
		rules: [
			{ test: /\.ts$/, enforce: "pre", loader: "tslint-loader", options: { typeCheck: true, emitErrors: true } },
			{ test: /\.tsx?$/, loader: "ts-loader" },
			{ test: /\.vue$/, include: /app/, loader: "vue-loader" },
			{ test: /\.scss$/, use: ["style-loader", "css-loader", "sass-loader"] }
		]
	},
	resolve: {
		extensions: [".js", ".ts", ".tsx", ".jsx", ".json"]
	}
};

module.exports = [
	Object.assign(
		{
			target: "electron-main",
			entry: { main: "./src/backend/main.ts" },
			mode: "development"
		},
		commonConfig
	),
	Object.assign(
		{
			target: "electron-renderer",
			entry: { gui: "./src/ui/boot.js" },
			plugins: [new HtmlWebpackPlugin({ title: "Faerglers", template: "index.html"}), new VueLoaderPlugin()],
			mode: "development"
		},
		commonConfig
	)
];
