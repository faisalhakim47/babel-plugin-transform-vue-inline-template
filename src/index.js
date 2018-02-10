const babylon = require('babylon')
const vueTemplateCompuler = require('vue-template-compiler')

exports.default = function () {
  return {
    visitor: {
      ObjectProperty({ node }) {
        if (node.key.name !== 'template') return
        node.key.name = 'render'
        node.key.loc.identifierName = 'render'
        node.key.loc.end.column = 8
        const template = node.value.quasis[0].value.raw
        const compiled = vueTemplateCompuler.compile(template, {
          preserveWhitespace: false
        }).staticRenderFns.join(';')
        const renderFn = `function render() {${compiled}}`
        const renderAst = babylon.parse(renderFn, {
          startLine: node.value.start,
        })
        node.value = renderAst
      }
    }
  }
}
