const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    output: {
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                loader: 'babel-loader',
                options: {
                    "presets": ["env"]
                    // plugins : ['transform-runtime']
                }
            },
            {test:/\.vue$/,use:['vue-loader']},
            {test:/\.css$/,use:['style-loader','css-loader']},
            {test:/\.less$/,use:['style-loader','css-loader','less-loader']},
            {test:/\.scss/,use:['style-loader','css-loader','sass-loader']},
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name:'./images/[name].[hash:7].[ext]'
                }
            },
        ]
    },
    resolve: {
        alias: {
            'vue': __dirname + '/node_modules/vue/dist/vue.js',
            'vue-router': __dirname + '/node_modules/vue-router/dist/vue-router.js',
            'vuex': __dirname + '/node_modules/vuex/dist/vuex.js',
            'vue-resource': __dirname + '/node_modules/vue-resource/dist/vue-resource.js'
        }
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: "./src/index.html"
        })
    ]
}



