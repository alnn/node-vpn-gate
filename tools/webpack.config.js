var debug   = true;
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var plugins = debug ? [
    new ExtractTextPlugin('style.css', {
        allChunks: true
    }),
    new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        minimize: true,
        sourceMap: false,
        mangle: true
    }),
] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
];

module.exports = {
    context: __dirname + "/../client",
    devtool: debug ? "inline-sourcemap" : null,
    entry: "./../client/src/client.js",
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-0'],
                    plugins: ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy']
                }
            },
            // SASS
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!sass')
            }
        ]
    },
    output: {
        path: __dirname + "/../client/public",
        filename: "client.min.js"
    },
    plugins: plugins
};
