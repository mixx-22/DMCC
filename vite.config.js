import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    host: true, // Expose to network
    proxy: {
      "/api": {
        target: "http://192.168.1.13:4000", // Your backend port
        changeOrigin: true,
      },
    },
  },
});
