import { Upload } from 'lucide-react';

export default function Header({ matter, user, onUpload }) {
  return (
    <div className="bg-white border-b border-[#dde1e7] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      <div>
        <div className="text-xs font-bold text-[#858585] uppercase tracking-widest mb-0.5">
          Evidence Library
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-[#58595b] font-medium">Active Matter:</span>
          <span className="text-base font-black text-[#1E365E]">{matter.name.toUpperCase()}</span>
          <span className="text-xs text-[#858585] font-semibold">MATTER {matter.number}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-[#f69139] hover:bg-[#e67422] text-white font-black text-xs rounded cursor-pointer transition-colors">
          <Upload style={{ width: 14, height: 14 }} />
          UPLOAD EVIDENCE
          <input
            type="file"
            multiple
            accept="*/*"
            onChange={onUpload}
            className="hidden"
          />
        </label>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1E365E] rounded-full flex items-center justify-center text-white text-xs font-black">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-xs font-semibold text-[#252627]">{user.name}</div>
            <div className="text-xs text-[#858585]">{user.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
