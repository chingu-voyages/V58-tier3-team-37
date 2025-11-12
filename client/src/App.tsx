import "./App.css";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-grow flex-col justify-start">
        <div className="bg-background w-full p-16">
          <div className="flex max-w-3xl flex-col justify-center gap-8">
            <h1 className="mb-4 text-2xl font-bold">App Tagline</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Non,
              nulla eos velit aperiam unde error est blanditiis accusantium, id,
              assumenda animi quam ducimus aspernatur? Quo, fugit. Commodi
              deserunt vel tempore!
            </p>
            <button className="bg-primary w-fit rounded-sm p-2">
              Explore Now →
            </button>
          </div>
        </div>
        <div className="">other content</div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
