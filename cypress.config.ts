import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  allowCypressEnv: false,
  e2e: {
    baseUrl: "http://127.0.0.1:8261",
  },
});
