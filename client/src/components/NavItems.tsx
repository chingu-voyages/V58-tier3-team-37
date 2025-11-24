import { Link, useLocation } from "react-router-dom";
import cn from "../utils/cn";

export default function NavItems() {
  const location = useLocation();
  const pathName = location.pathname;
  return (
    <ul className="hidden w-1/2 justify-around sm:flex">
      <li
        className={cn(
          pathName === "/" ? "font-bold" : "",
          "cursor-pointer hover:font-bold",
        )}
      >
        <Link to="/">Home</Link>
      </li>
      <li
        className={cn(
          pathName === "/map" ? "font-bold" : "",
          "cursor-pointer hover:font-bold",
        )}
      >
        <Link to="/map">Map</Link>
      </li>
      <li
        className={cn(
          pathName === "/list" ? "font-bold" : "",
          "cursor-pointer hover:font-bold",
        )}
      >
        <Link to="/list">List</Link>
      </li>
    </ul>
  );
}
