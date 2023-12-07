const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    popup: path.join(__dirname, 'src', 'popup.tsx'),
    background: path.join(__dirname, 'src', 'background.ts'),
    contentScript: path.join(__dirname, 'src', 'content_script.tsx'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: resourcePath => !resourcePath.endsWith('.global.scss'),
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              },
            },
            'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'src/static/images', to: 'images' },
        { from: 'src/_locales', to: '_locales'}
        // { from: 'src/static/styles.css', to: '.' },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      // filename: '[name].css',
      // chunkFilename: '[id].css',
    }),
  ],
  mode: 'development',
  devtool: isProduction ? false : 'cheap-module-source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            ascii_only: true,
          },
        },
      }),
    ],
  },
};
