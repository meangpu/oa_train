import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}
if (import.meta.env.DEV) {
  rootElement.classList.add("dev");
} else {
  rootElement.classList.add("prod");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
