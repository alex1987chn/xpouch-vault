import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router";
import App from "./App";
import "./index.css";

const VaultPage = lazy(() => import("./pages/VaultPage"));
const LobsterPage = lazy(() => import("./pages/LobsterPage"));

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <VaultPage />
              </Suspense>
            }
          />
          <Route
            path="lobster"
            element={
              <Suspense fallback={<PageLoader />}>
                <LobsterPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);
