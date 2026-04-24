const fs = require('fs');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  };

  if (isProd) {
    config.minimizer = [
      new CssMinimizerPlugin({
        test: /\.css$/i
      }),
      new TerserPlugin({
        test: /\.js(\?.*)?$/i
      })
    ];
  }
  return config;
};

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[contenthash:8].${ext}`);

const babelOptions = (preset) => {
  const options = {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties']
  };
  if (preset) {
    options.presets.push(preset);
  }
  return options;
};

const jsLoaders = () => {
  return [
    {
      loader: 'babel-loader',
      options: babelOptions()
    }
  ];
};

const esLintPlugin = (isDev) => (isDev ? [] : [
  new ESLintPlugin({
    extensions: ['ts', 'js'],
    overrideConfigFile: path.resolve(__dirname, 'eslint.config.js'),
  })
]);
const pages = fs.readdirSync(path.resolve(__dirname, 'src')).filter((fileName) => fileName.endsWith('.html'));

const plugins = () => {
  const base = [
    new CleanWebpackPlugin(),
    ...pages.map(
      (page) =>
        new HTMLWebpackPlugin({
          template: page,
          filename: page,
          inject: 'body',
          minify: {
            collapseWhitespace: isProd
          }
        })
    ),
    new CopyPlugin({
      patterns: [
        {
          from: '**/*',
          context: path.resolve(__dirname, './src'),
          globOptions: {
            ignore: ['**/*.js', '**/*.ts', '**/*.css', '**/*.scss', '**/*.sass', '**/*.html']
          },
          noErrorOnMissing: true,
          force: true
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: filename('css')
    }),
    ...esLintPlugin(isDev)
  ];
  if (isProd) {
    base.push(new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: true,
      reportFilename: 'report.html'
    }));
  }
  return base;
};

module.exports = {
  mode: isDev ? 'development' : 'production',
  target: ['web', 'es6'],

  entry: {
    main: './index.js'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: filename('js'),
    chunkFilename: '[id].[chunkhash].js',
    sourceMapFilename: '[file].map',
    assetModuleFilename: '[file]',
    publicPath: '/'
  },

  performance: {
    maxAssetSize: 2000000,
    maxEntrypointSize: 2000000
  },

  context: path.resolve(__dirname, 'src'),

  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@models': path.resolve(__dirname, 'src/models')
    }
  },

  optimization: optimization(),

  devServer: {
    hot: true,
    port: 8888,
    historyApiFallback: true
  },

  devtool: isDev ? 'eval-source-map' : false,

  plugins: plugins(),

  module: {
    rules: [
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg|webp)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(?:mp3|wav|ogg|mp4)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: babelOptions('@babel/preset-typescript')
      },
      {
        test: /\.css$/i,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                quietDeps: true,
                silenceDeprecations: ['import']
              }
            }
          }
        ]
      }
    ]
  }
};
