import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { HomePage } from "./pages/HomePage";
import { MemoriesPage } from "./pages/MemoriesPage";
import { PlacesPage } from "./pages/PlacesPage";
import { FoodPage } from "./pages/FoodPage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/places" element={<PlacesPage />} />
        <Route path="/food" element={<FoodPage />} />
        <Route path="/memories" element={<MemoriesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
