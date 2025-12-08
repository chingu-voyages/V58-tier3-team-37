import { Link, useLocation } from "react-router-dom";
import cn from "../utils/cn";

export default function NavItems() {
  const location = useLocation();
  const pathName = location.pathname;
  return (
    <ul className="menu menu-horizontal gap-2">
      <li
        className={cn(
          pathName === "/" ? "border-b-2" : "",
          "cursor-pointer hover:border-b-2",
        )}
      >
        <Link to="/">Home</Link>
      </li>
      <li
        className={cn(
          pathName === "/map" ? "border-b-2" : "",
          "cursor-pointer hover:border-b-2",
        )}
      >
        <Link to="/map">Map</Link>
      </li>
      <li
        className={cn(
          pathName === "/list" ? "border-b-2" : "",
          "cursor-pointer hover:border-b-2",
        )}
      >
        <Link to="/list">List</Link>
      </li>
    </ul>
  );
}
