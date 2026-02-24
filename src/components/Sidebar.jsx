import { LayoutGrid, Camera, Library, Package, ClipboardList } from 'lucide-react';


const NAV_ITEMS = [
  { id: 'overview', label: 'Matter Overview', icon: LayoutGrid },
  { id: 'capture', label: 'Capture', icon: Camera },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'bundle-builder', label: 'Bundle Builder', icon: Package },
  { id: 'audit-trail', label: 'Audit Trail', icon: ClipboardList },
];

export default function Sidebar({ activePage, onNavigate, matter, user }) {
  return (
    <div className="w-56 min-h-screen bg-[#1E365E] flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="LEAP" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-white font-black text-xs uppercase tracking-wide leading-tight">Evidence Library</div>
            <div className="text-[#f69139] text-xs font-bold">LEAP</div>
          </div>
        </div>
        <div className="text-white/50 text-xs font-semibold uppercase tracking-wider">
          Matter {matter.number}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 mt-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-semibold transition-all ${
              activePage === id
                ? 'bg-white/15 text-white border-l-2 border-[#f69139] pl-[10px]'
                : 'text-white/65 hover:text-white hover:bg-white/8'
            }`}
          >
            <Icon className="flex-shrink-0" style={{ width: 15, height: 15 }} />
            {label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#f69139] rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-semibold truncate">{user.name}</div>
            <div className="text-white/45 text-xs truncate">{user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
