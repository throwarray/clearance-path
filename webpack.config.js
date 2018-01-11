// const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const FlowStatusWebpackPlugin = require('flow-status-webpack-plugin');
const BabiliPlugin = require('babili-webpack-plugin');
const CONFIGURE_SERVER = require('./server/server.cfg.js');
const BUILD_SETTINGS = require('./build.cfg.js');

module.exports = function (env = 'development') {
    const PRODUCTION = env === 'production';
    const SETTINGS = BUILD_SETTINGS(env);
    const config = {
        entry: {
            index: './src/index.js',
            vendor: SETTINGS.vendor || ['./src/vendor.js']
        },
        output: {
            path: path.join(__dirname, '/server/dist'),
            filename: '[name].js',
            chunkFilename: '[id].chunk.js',
            sourceMapFilename: '[name].map'
        },
        devServer: {
            // stats: 'minimal',
            host: SETTINGS.host,
            port: SETTINGS.port,
            hot: SETTINGS.hot, // true,
            inline: true,
            watchContentBase: true,
            contentBase: SETTINGS.contentBase,
            watchOptions: { ignored: /(node_modules|bower_components)/ },
            setup (app) {
                CONFIGURE_SERVER(app, env, SETTINGS, true);
            }
        },
        devtool: PRODUCTION ? 'source-map' : 'eval-source-map',
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: Infinity
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'commons' //,
                // children: true
            }),
            new ExtractTextPlugin('./style.css'),
            new HtmlWebpackPlugin({
                env: {
                    NODE_ENV: env,
                    version: SETTINGS.version
                },
                minify: {
                    removeComments: true,
                    removeStyleLinkTypeAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeRedundantAttributes: true,
                    collapseWhitespace: true
                    // removeOptionalTags: true
                },
                showErrors: false,
                template: path.join(__dirname, '/src/index.ejs')
            })
            // new FlowStatusWebpackPlugin({
            //     // restartFlow: false,
            //     binaryPath: require('flow-bin'),
            //     /* eslint-disable no-console */
            //     onError: function(stdout) {
            //         console.log(stdout);
            //     },
            //     onSuccess: function(stdout){
            //         console.log(stdout);
            //     }
            //     /* eslint-disable no-console */
            // })
        ],
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'eslint-loader',
                    options: {
                        cache: true,
                        failOnError: false
                    }
                },
                {
                    test: /\.(js|jsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader'
                },
                {
                    test: /\.s?css$/,
                    use: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                options: { importLoaders: 1 }
                            },
                            'postcss-loader',
                            'sass-loader'
                        ]
                    })
                },
                {
                    test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
                    use: ['file-loader']
                }
            ]
        }
    };

    if (PRODUCTION || SETTINGS.production) {
        Array.prototype.push.apply(
            config.plugins,
            [
                new webpack.LoaderOptionsPlugin({
                    minimize: true,
                    debug: false
                }),
                new BabiliPlugin(),
                new webpack.optimize.UglifyJsPlugin({
                    sourceMap: true,
                    beautify: false,
                    comments: false,
                    compress: {
                        screw_ie8: true,
                        warnings: true,
                        drop_console: false
                    },
                    mangle: {
                        screw_ie8: true,
                        keep_fnames: false
                    }
                }),
                new CompressionPlugin({
                    asset: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: /\.js$|\.html$/
                })
            ]
        );
    }

    return config;
};
