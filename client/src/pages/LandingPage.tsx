import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <>
      <div className="w-full p-16">
        <div className="flex max-w-3xl flex-col justify-center gap-8">
          <h1 className="mb-4 text-2xl font-bold">App Tagline</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Non, nulla
            eos velit aperiam unde error est blanditiis accusantium, id,
            assumenda animi quam ducimus aspernatur? Quo, fugit. Commodi
            deserunt vel tempore!
          </p>
          <Link to="/search">
            <button className="btn btn-primary w-fit">Explore Now</button>
          </Link>
        </div>
      </div>
      <div>other content</div>
    </>
  );
}
