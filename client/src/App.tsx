import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SidebarNav from "./components/SidebarNav";
import LandingPage from "./pages/LandingPage";
import ListPage from "./pages/ListPage";
import MapPage from "./pages/MapPage";
import SearchPage from "./pages/SearchPage";

function App() {
  return (
    <>
      <div className="drawer bg-background-brand font-sans">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="mt-16 flex min-h-screen flex-grow flex-col justify-start">
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
        <div className="drawer-side">
          <label
            htmlFor="my-drawer-2"
            aria-label="close sidebar"
            className="drawer-overlay"
          ></label>
          <SidebarNav />
        </div>
      </div>
    </>
  );
}

export default App;
