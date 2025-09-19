const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  mode: 'production', // or 'development' for dev
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      { test: /\.css$/, use: ['style-loader','css-loader'] },
    ],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "data", to: "data", noErrorOnMissing: true },    // copies data/ → dist/data/ (don't fail if missing)
          { from: "api", to: "api" },      // copies api/ → dist/api/
        ],
      }),
  ],

  performance: {
  hints: false
}
};
