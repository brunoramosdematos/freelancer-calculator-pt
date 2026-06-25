import { createApp } from "vue";
import "./style.scss";
import App from "@/App.vue";
import { createPinia } from "pinia";
import directives from "./directives.js";
import vClickOutside from "click-outside-vue3";
import router from "./router";
import { i18n } from "@/i18n";

const app = createApp(App);

for (const [name, directive] of Object.entries(directives)) {
  app.directive(name, directive);
}
app.use(createPinia());
app.use(vClickOutside);
app.use(i18n);

app.use(router);
app.mount("#app");
