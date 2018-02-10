const babylon = require('babylon')
const vueCompiler = require('vue-template-compiler')
const vueTranspile = require('vue-template-es2015-compiler')

module.exports = function () {
  return {
    visitor: {
      ObjectProperty: {
        exit({ node }) {
          if (node.key.name !== 'template') return
          if (!node.value.quasis && node.value.type !== 'StringLiteral') return

          // Options
          const functionalRender = true
          const bubleOptions = {
            transforms: {
              stripWithFunctional: true
            }
          }

          node.key.name = 'render'
          node.key.loc.identifierName = 'render'
          node.key.loc.end.column = 8

          const template = node.value.type === 'StringLiteral'
            ? node.value.value
            : node.value.quasis[0].value.raw

          const compiled = vueCompiler.compile(template, {
            preserveWhitespace: false
          })

          const staticRenderFns = compiled.staticRenderFns
            .map((fn) => toFunction(fn, functionalRender))

          const renderFn = vueTranspile(`(function () {
            var staticRenderFns = [${staticRenderFns.join(',')}];
            return ${toFunction(compiled.render, functionalRender)};
          })()`, bubleOptions)

          const renderFnAst = babylon.parse(renderFn)

          // This is wrong, I dont know how to do it correctly
          node.value = renderFnAst
        }
      }
    }
  }
}

/**
 * stolen from https://github.com/vuejs/vue-loader/blob/52658f0891ed0bf173189eb6b5e3a26d102db81d/lib/template-compiler/index.js#L97
 * 
 * @param {string} code 
 * @param {boolean} stripWithFunctional 
 */
function toFunction(code, stripWithFunctional) {
  return (
    'function (' + (stripWithFunctional ? '_h,_vm' : '') + ') {' + code + '}'
  )
}
