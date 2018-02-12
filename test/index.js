const path = require('path')
const webpack = require('webpack')
const babel = require('babel-core')
const TransformVueInlineTemplate = require('../src/index.js')

const p = rel => {
  const relStr = Array.isArray(rel) ? rel.join('') : rel
  return path.join(__dirname, relStr)
}

webpack({
  entry: {
    'app': p`./app/index.js`,
  },
  output: {
    path: p`./`,
    filename: 'result.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [TransformVueInlineTemplate]
          }
        }
      },
    ]
  },
}, (err, stats) => {
  // if (err) console.log(err)
  // else console.log(stats)
})
