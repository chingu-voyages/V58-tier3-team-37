import { Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import MapPage from "./pages/MapPage";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-grow flex-col justify-start">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
