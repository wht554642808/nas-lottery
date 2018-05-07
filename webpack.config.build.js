const path = require('path')

module.exports = {

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
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
}



