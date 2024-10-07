const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        select: ['./select.js', './select.css']
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin()
    ],
    output: {
        filename: '[name].min.js',
        path: path.resolve(__dirname, 'build'),
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserWebpackPlugin()
        ],
    },
};