var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');
module.exports = {
    entry: __dirname + "/src/index.tsx",
    output: {
        path: __dirname + "/cordova/rapid/www",
        filename: "bundle.js"
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    "presets" : [["es2015", {modules: false}]],
                  }
                }
              },

            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' }
        ]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index-cordova.html',
            hash: true,
            filename: './index.html'
        }),

        new webpack.ProvidePlugin({
            $: 'jquery',
            Popper: 'popper.js'
          })
        
    ]
};