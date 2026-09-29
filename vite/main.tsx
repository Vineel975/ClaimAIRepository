import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";
import { ClaimDemo } from "@/components/ClaimDemo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClaimDemo />
  </StrictMode>,
);
