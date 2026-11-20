interface MobileTopMenuProps {
  menus: string[];
  view: string;
  setView: (view: string) => void;
  icons: Record<string, string>;
}

export default function MobileTopMenu({ menus, view, setView, icons }: MobileTopMenuProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-black text-white p-3 flex gap-2 overflow-x-auto z-10">
      {menus.map((m) => (
        <button
          key={m}
          onClick={() => setView(m)}
          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap flex items-center gap-1 ${
            view === m ? "bg-orange-500" : "bg-gray-800"
          }`}
        >
          <span>{icons[m]}</span>
          <span>{m}</span>
        </button>
      ))}
    </div>
  );
}
