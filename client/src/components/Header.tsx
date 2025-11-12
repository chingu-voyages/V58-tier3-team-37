import MenuIcon from "../icons/MenuIcon";
import NavItems from "./NavItems";

export default function Header() {
  const date = new Date();
  return (
    <header className="align-center bg-primary flex justify-between p-4 shadow-md">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400" />
      <NavItems />
      <time className="self-center text-gray-600">
        {date.toLocaleDateString()}
      </time>
      <MenuIcon />
    </header>
  );
}
