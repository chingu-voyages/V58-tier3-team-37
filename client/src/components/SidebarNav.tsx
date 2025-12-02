import { Link, useLocation } from "react-router-dom";
import cn from "../utils/cn";

export default function SidebarNav() {
  const location = useLocation();
  const pathName = location.pathname;

  const closeNavbar = () => {
    const checkbox = document.getElementById(
      "my-drawer-2",
    ) as HTMLInputElement | null;
    if (checkbox) {
      checkbox.checked = false;
    }
  };
  return (
    <ul className="menu bg-primary-brand mt-16 h-[calc(100vh-4rem)] w-full p-4 text-base transition-none">
      <li
        onClick={closeNavbar}
        className={cn(
          pathName === "/" ? "font-bold" : "",
          "flex h-16 cursor-pointer items-center hover:font-bold",
        )}
      >
        <Link
          className="hover:bg-primary-brand-hover active:bg-primary-brand-hover flex h-full w-full items-center justify-center"
          to="/"
        >
          Home
        </Link>
      </li>
      <li
        onClick={closeNavbar}
        className={cn(
          pathName === "/map" ? "font-bold" : "",
          "flex h-16 cursor-pointer items-center hover:font-bold",
        )}
      >
        <Link
          className="hover:bg-primary-brand-hover active:bg-primary-brand-hover flex h-full w-full items-center justify-center"
          to="/map"
        >
          Map
        </Link>
      </li>
      <li
        onClick={closeNavbar}
        className={cn(
          pathName === "/list" ? "font-bold" : "",
          "flex h-16 cursor-pointer items-center",
        )}
      >
        <Link
          className="hover:bg-primary-brand-hover active:bg-primary-brand-hover flex h-full w-full items-center justify-center"
          to="/list"
        >
          List
        </Link>
      </li>
    </ul>
  );
}
