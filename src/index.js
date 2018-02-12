const babylon = require('babylon')
const vueCompiler = require('vue-template-compiler')
const vueTranspile = require('vue-template-es2015-compiler')
const cloneDeep = require('lodash.clonedeep')

module.exports = function () {
  return {
    visitor: {
      ObjectProperty: {
        exit(path) {
          const { node: renderNode } = path

          if (renderNode.key.name !== 'template') return
          if (!renderNode.value.quasis && renderNode.value.type !== 'StringLiteral') return

          // Options
          const bubleOptions = {
            transforms: {
              stripWithFunctional: true
            }
          }
          const functionalRender = bubleOptions.transforms.stripWithFunctional

          const template = renderNode.value.type === 'StringLiteral'
            ? renderNode.value.value
            : renderNode.value.quasis[0].value.raw

          const compiled = vueCompiler.compile(template, {
            preserveWhitespace: false
          })

          const render = toFunction('render', compiled.render, functionalRender)
          const renderAst = babylon.parse(render)

          renderNode.key.name = 'render'
          renderNode.key.loc.identifierName = 'render'
          renderNode.key.loc.end.column = 8
          renderNode.value = renderAst.program.body[0]

          if (compiled.staticRenderFns.length) {
            const staticRenderFnsNode = cloneDeep(renderNode)
            staticRenderFnsNode.key.name = 'staticRenderFns'
            staticRenderFnsNode.key.loc.identifierName = 'staticRenderFns'
            const staticRenderFns = `[${
              compiled.staticRenderFns
              .map((fn) => toFunction('staticRender', fn, functionalRender))
              .join(',')
            }]`
            const staticRenderFnsAst = babylon.parse(staticRenderFns)
            staticRenderFnsNode.value = staticRenderFnsAst.program.body[0].expression
            path.parent.properties.push(staticRenderFnsNode)
          }
        }
      }
    }
  }
}


let fnId = 0
/**
 * stolen from https://github.com/vuejs/vue-loader/blob/52658f0891ed0bf173189eb6b5e3a26d102db81d/lib/template-compiler/index.js#L97
 * 
 * @param {string} name 
 * @param {string} code 
 * @param {boolean} stripWithFunctional 
 */
function toFunction(name = '_', code, stripWithFunctional) {
  return vueTranspile(
    `function _${name}${fnId++}(${stripWithFunctional ? '_h,_vm' : ''}){${code}}`
  )
}
