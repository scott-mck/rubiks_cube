const { resolve } = require('path');

module.exports = {
	entry: ['babel-regenerator-runtime', `${__dirname}/src/js/main.js`],
	output: {
		path: `${__dirname}/dist`,
		filename: 'built.js',
		publicPath: '/dist/'
	},
	module: {
		loaders: [
			{
				test: /.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015', 'stage-2']
				}
			}
		]
	}
};
