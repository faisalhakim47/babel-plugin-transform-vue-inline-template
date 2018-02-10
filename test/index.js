const babel = require('babel-core')
const TransformVueInlineTemplate = require('../src/index.js')

const code = `
export default {
  template: \`
    <section>
      <h1>Todo List</h1>
      <ul v-for="item in items">
        <li v-if="!item.done">{{ item.label }}</li>
      </ul>
    </section>
  \`
}
`

const result = babel.transform(code, {
  plugins: [TransformVueInlineTemplate]
})

console.log(result.code)
