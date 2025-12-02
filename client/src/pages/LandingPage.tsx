import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <>
      <div className="relative flex min-h-screen w-full flex-1 items-stretch p-11 pt-16 sm:p-16">
        <div className="absolute inset-0 z-1 bg-[url('/src/assets/images/background-mobile.jpg')] bg-cover opacity-60"></div>
        <div className="relative z-10 max-w-3xl text-center">
          <div className="flex h-1/2 items-start justify-center">
            <h1 className="mb-4 text-2xl font-bold">
              Experience the World of Chingu with Your Own Eyes
            </h1>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col gap-14">
              <Link to="/search">
                <button className="btn btn-primary-brand w-fit">
                  Explore Now
                </button>
              </Link>
              <p>
                Visualize the locations of Chingus, the roles they fulfill, and
                the characsteristics that distinguish each member in a single
                interactive map.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>other content</div>
    </>
  );
}
