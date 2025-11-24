import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <>
      <div className="w-full p-16">
        <div className="flex max-w-3xl flex-col justify-center gap-8">
          <h1 className="mb-4 text-2xl font-bold">
            Experience the World of Chingu with Your Own Eyes
          </h1>
          <p>
            Visualize the locations of Chingus, the roles they fulfill, and the
            characteristics that distinguish each member in a single interactive
            map.
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
