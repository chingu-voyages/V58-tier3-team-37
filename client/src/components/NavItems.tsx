import { Link, useLocation } from "react-router-dom";
import cn from "../utils/cn";

export default function NavItems() {
  const location = useLocation();
  const pathName = location.pathname;
  return (
    <ul className="menu menu-horizontal flex w-full justify-between gap-2">
      <li
        className={cn(
          pathName === "/" ? "border-b-2" : "",
          "cursor-pointer hover:border-b-2",
        )}
      >
        <Link to="/" className="hover:bg-background-brand">
          Home
        </Link>
      </li>
      <li
        className={cn(
          pathName === "/map" ? "border-b-2" : "",
          "cursor-pointer hover:border-b-2",
        )}
      >
        <Link to="/map" className="hover:bg-background-brand">
          Map
        </Link>
      </li>
      <li
        className={cn(
          pathName === "/list" ? "border-b-2" : "",
          "cursor-pointer hover:border-b-2",
        )}
      >
        <Link to="/list" className="hover:bg-background-brand">
          List
        </Link>
      </li>
    </ul>
  );
}
