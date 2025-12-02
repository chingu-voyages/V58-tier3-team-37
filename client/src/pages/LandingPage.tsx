import { Link } from "react-router-dom";
import RightArrow from "../icons/RightArrow";

export default function LandingPage() {
  return (
    <>
      <div className="relative flex min-h-screen w-full flex-1 items-stretch justify-center p-11 pt-16 sm:p-16">
        <div className="absolute inset-0 z-1 bg-[url('/src/assets/images/background-mobile.jpg')] bg-cover opacity-60 sm:hidden"></div>
        <div className="absolute inset-0 z-1 hidden bg-[url('/src/assets/images/background.jpg')] bg-cover opacity-60 sm:block"></div>
        <div className="relative z-10 max-w-96 text-center">
          <div className="flex h-1/2 items-start justify-center">
            <h1 className="mb-4 text-2xl/10 font-bold">
              Experience the World of Chingu with Your Own Eyes
            </h1>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col gap-14">
              <Link to="/search">
                <button className="btn bg-primary-brand border-primary-brand w-fit border">
                  Explore Now
                </button>
              </Link>
              <p className="text-lg/8">
                Visualize the locations of Chingus, the roles they fulfill, and
                the characteristics that distinguish each member in a single
                interactive map.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col items-center justify-center gap-7 p-8">
          <div className="card bg-background-brand border-text-brand w-full max-w-96 border shadow-sm">
            <div className="card-body">
              <h2 className="card-title flex w-full justify-center">
                The Chingu Member Map
              </h2>
              <div className="divider divider-white m-0" />
              <p className="text-sm/8">
                Explore our global community! This interactive map shows member
                demographics (role, tier, country, and voyage) on a map, helping
                you connect with teammates and discover data in a whole new way.
              </p>
            </div>
          </div>
          <div className="card bg-background-brand border-text-brand w-full max-w-96 border shadow-sm">
            <div className="card-body">
              <h2 className="card-title flex w-full justify-center">
                Our Global Reach
              </h2>
              <div className="divider divider-white m-0" />
              <p className="text-sm/8">
                With members in every corner of the world, this map was created
                to reveal the true scale and diversity of the Chingu community.
                Our purpose is simple: to make connections out of data, bring
                voyagers closer together, and showcase the power of global tech
                collaboration.
              </p>
              <div className="card-actions justify-center">
                <Link to="/search">
                  <button className="btn bg-primary-brand border-primary-brand relative w-40 border">
                    Get Started
                    <div className="absolute right-2">
                      <RightArrow />
                    </div>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
