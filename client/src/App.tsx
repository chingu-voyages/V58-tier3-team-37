import { Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import ListPage from "./pages/ListPage";
import MapPage from "./pages/MapPage";
import SearchPage from "./pages/SearchPage";

function App() {
  return (
    <div className="bg-background flex min-h-screen flex-col font-sans">
      <Header />
      <main className="mt-16 flex flex-grow flex-col justify-start">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
