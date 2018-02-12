export default {
  template: `
    <main>
      <section>
        <h1>Todo List</h1>
        <ul v-for="item in items">
          <li v-if="!item.done">{{ item.label }}</li>
        </ul>
      </section>
      <section>
        <test-component></test-component>
      </section>
      <section>
        <p>Static component, probably</p>
      </section>
      <section>
        <p>Static component, probably again</p>
      </section>
    </main>
  `
}
