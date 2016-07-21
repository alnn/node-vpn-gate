var webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

var plugins = [
    new ExtractTextPlugin('style.css', {
        allChunks: true
    }),
    new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        minimize: true,
        sourceMap: false,
        mangle: true
    }),
];

module.exports = {
    context: __dirname + "/../client",
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
