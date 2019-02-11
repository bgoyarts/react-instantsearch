const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const outputPath = path.join(__dirname, '..', 'dist', 'examples');

const examples = glob
  .sync(path.join(__dirname, '!(*.js)'))
  .map(example => path.basename(example));

module.exports = {
  entry: examples.reduce(
    (acc, filename) => ({
      ...acc,
      [filename]: path.join(__dirname, filename, 'index.js'),
    }),
    {}
  ),
  output: {
    filename: '[name]/index.[hash].js',
    path: outputPath,
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  plugins: examples
    .map(
      filename =>
        new HTMLWebpackPlugin({
          template: path.join(__dirname, filename, 'index.html'),
          filename: path.join(outputPath, filename, 'index.html'),
          chunks: [filename],
        })
    )
    .concat([
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),

      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            warnings: false,
          },
          output: {
            comments: false,
          },
        },
      }),
    ]),
};
