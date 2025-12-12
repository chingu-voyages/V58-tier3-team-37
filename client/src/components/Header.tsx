import favicon from "../assets/favicon.png";
import MenuIcon from "../icons/MenuIcon";
import NavItems from "./NavItems";

export default function Header() {
  const date = new Date();
  return (
    <header className="align-center bg-background-brand fixed z-50 flex h-16 w-full justify-between shadow-md">
      <div className="navbar bg-background-brand flex w-full justify-between p-4">
        <img src={favicon} alt="Favicon" className="h-8 w-8" />
        <time className="block text-gray-600 sm:hidden">
          {date.toLocaleDateString()}
        </time>
        <div className="flex-none sm:hidden">
          <label
            htmlFor="my-drawer-2"
            aria-label="open sidebar"
            className="btn btn-square btn-ghost"
          >
            <MenuIcon />
          </label>
        </div>
        <div className="hidden w-1/2 flex-none sm:block">
          <NavItems />
        </div>
        <time className="hidden text-gray-600 sm:block">
          {date.toLocaleDateString()}
        </time>
      </div>
    </header>
  );
}
