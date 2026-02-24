import { useState } from 'react';
import {
  Star, CheckCircle, FileText, ImageIcon, File, Search,
  Shield, Clock, HardDrive, Hash, AlertCircle, Activity, Loader2
} from 'lucide-react';

function FileTypeIcon({ fileType }) {
  if (fileType === 'image') return <ImageIcon className="text-purple-400" style={{ width: 18, height: 18 }} />;
  if (fileType === 'pdf') return <FileText className="text-red-400" style={{ width: 18, height: 18 }} />;
  if (fileType === 'document') return <FileText className="text-blue-400" style={{ width: 18, height: 18 }} />;
  return <File className="text-[#858585]" style={{ width: 18, height: 18 }} />;
}

function EvidenceItem({ item, isChecked, isSelected, onSelect, onToggleCheck, onToggleFavourite }) {
  return (
    <div
      onClick={() => onSelect(item.id)}
      className={`flex items-start gap-2.5 p-2.5 rounded cursor-pointer transition-all border ${
        isSelected
          ? 'bg-[#e6eff6] border-[#ccdfee]'
          : 'bg-white border-transparent hover:bg-[#f6f6f6] hover:border-[#e9ebef]'
      }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggleCheck(item.id)}
        onClick={e => e.stopPropagation()}
        className="mt-0.5 flex-shrink-0 accent-[#1E365E]"
        style={{ width: 14, height: 14 }}
      />

      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded overflow-hidden bg-[#f0f0f0] flex items-center justify-center"
        style={{ width: 36, height: 36 }}
      >
        {item.previewUrl ? (
          <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <FileTypeIcon fileType={item.fileType} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="inline-flex items-center px-1.5 py-0.5 bg-[#1E365E] text-white font-black rounded"
            style={{ fontSize: 9 }}>
            {item.evNumber}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {item.hashStatus === 'verified' && (
              <CheckCircle className="text-[#0d630d]" style={{ width: 13, height: 13 }} />
            )}
            {item.hashStatus === 'computing' && (
              <Loader2 className="text-[#858585] animate-spin" style={{ width: 13, height: 13 }} />
            )}
            <button
              onClick={e => { e.stopPropagation(); onToggleFavourite(item.id); }}
              className={`transition-colors ${item.isFavourite ? 'text-[#f69139]' : 'text-[#dde1e7] hover:text-[#f69139]'}`}
            >
              <Star fill={item.isFavourite ? 'currentColor' : 'none'} style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>

        <p className="text-xs font-semibold text-[#252627] truncate mb-0.5">{item.name}</p>

        <div className="flex items-center gap-1 text-[#858585]" style={{ fontSize: 10 }}>
          <span>{new Date(item.uploadedAt).toLocaleDateString('en-AU')}</span>
          <span>·</span>
          <span>{item.fileSize}</span>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex gap-2">
      <div className="text-[#1E365E] flex-shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="font-black text-[#58595b] uppercase tracking-wide mb-0.5" style={{ fontSize: 9 }}>{label}</div>
        <div className="text-[#252627] break-all" style={{ fontSize: 10 }}>{value}</div>
      </div>
    </div>
  );
}

function ForensicPanel({ item }) {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#858585] p-8">
        <Shield style={{ width: 40, height: 40 }} className="mb-3 opacity-20" />
        <p className="text-sm font-semibold">Select an item</p>
        <p className="text-xs mt-1 text-center">to view forensic specifications</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3">
      {/* Header badge */}
      <div className="bg-[#1E365E] rounded p-3.5 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 uppercase tracking-widest font-bold" style={{ fontSize: 9 }}>Artifact ID</span>
          <span className="px-2 py-0.5 bg-[#f69139] text-white font-black rounded" style={{ fontSize: 9 }}>
            {item.evNumber}
          </span>
        </div>
        <div className="text-[#f69139] font-black uppercase tracking-wide" style={{ fontSize: 9 }}>Forensic Protocol</div>
        <div className="text-sm font-black">VERIFIED & READY</div>
      </div>

      {/* Preview */}
      <div className="bg-[#f0f0f0] rounded border border-[#dde1e7] overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: '16/9' }}>
        {item.previewUrl ? (
          <img src={item.previewUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#858585] p-4">
            <FileTypeIcon fileType={item.fileType} />
            <span className="text-xs text-center truncate w-full px-2">{item.name}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#e7f2e7] border border-[#cfe5cf] rounded">
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: item.hashStatus === 'verified' ? '#0d630d' : item.hashStatus === 'computing' ? '#f69139' : '#9e0c19' }}
        />
        <span className="font-black text-[#0d630d]" style={{ fontSize: 10 }}>
          {item.hashStatus === 'computing' ? 'COMPUTING HASH...' : item.hashStatus === 'verified' ? 'VERIFIED & READY' : 'VERIFICATION ERROR'}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 p-3 bg-white rounded border border-[#dde1e7]">
        <DetailRow
          icon={<Shield style={{ width: 12, height: 12 }} />}
          label="Matter Case Reference"
          value={item.evNumber}
        />
        <DetailRow
          icon={<Clock style={{ width: 12, height: 12 }} />}
          label="Capture Timestamp"
          value={new Date(item.uploadedAt).toLocaleString('en-AU')}
        />
        <DetailRow
          icon={<HardDrive style={{ width: 12, height: 12 }} />}
          label="File Size / Type"
          value={`${item.fileSize} — ${item.fileType.charAt(0).toUpperCase() + item.fileType.slice(1)}`}
        />
        <DetailRow
          icon={<Hash style={{ width: 12, height: 12 }} />}
          label="SHA-256 Hash"
          value={
            item.hash
              ? `${item.hash.substring(0, 20)}...${item.hash.slice(-8)}`
              : item.hashStatus === 'computing'
              ? 'Computing...'
              : 'Unavailable'
          }
        />
      </div>

      {/* Integrity Alert */}
      <div className="p-3 bg-[#e6eff6] border border-[#ccdfee] rounded">
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertCircle className="text-[#1E365E]" style={{ width: 12, height: 12 }} />
          <span className="font-black text-[#1E365E] uppercase tracking-wide" style={{ fontSize: 9 }}>Integrity Alert</span>
        </div>
        <p className="text-[#252627]" style={{ fontSize: 10 }}>
          {item.hashStatus === 'verified'
            ? 'Verified & Ready — ArtiFact hash matches source. No verification issues detected.'
            : item.hashStatus === 'computing'
            ? 'Hash computation in progress. Please wait...'
            : 'Hash verification unavailable for this file type.'}
        </p>
      </div>

      {/* Audit Trail */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Activity className="text-[#1E365E]" style={{ width: 12, height: 12 }} />
          <span className="font-black text-[#1E365E] uppercase tracking-wide" style={{ fontSize: 9 }}>Forensic Audit Trail</span>
        </div>
        <div className="space-y-2">
          {item.auditTrail?.map((entry, i) => (
            <div key={i} className="flex items-start gap-2" style={{ fontSize: 10 }}>
              <div className="w-1.5 h-1.5 bg-[#0060a9] rounded-full mt-1 flex-shrink-0" />
              <div>
                <span className="text-[#252627] font-semibold">{entry.action}</span>
                <span className="text-[#858585] ml-1">
                  — {new Date(entry.timestamp).toLocaleString('en-AU')} · {entry.user}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage({
  evidenceItems,
  checkedIds,
  selectedEvidenceId,
  onSelectEvidence,
  onToggleCheck,
  onToggleFavourite,
  onGenerateBundle,
}) {
  const [search, setSearch] = useState('');
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [bundleName, setBundleName] = useState('');

  const selectedItem = evidenceItems.find(e => e.id === selectedEvidenceId) || null;

  const filterItems = (items) => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.evNumber.toLowerCase().includes(q)
    );
  };

  const favourites = filterItems(evidenceItems.filter(e => e.isFavourite));
  const uploads = filterItems(evidenceItems.filter(e => !e.isFavourite));

  const handleConfirmBundle = () => {
    onGenerateBundle(bundleName.trim() || `Bundle ${new Date().toLocaleDateString('en-AU')}`);
    setBundleName('');
    setShowBundleModal(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel */}
      <div className="flex flex-col border-r border-[#dde1e7] bg-white overflow-hidden flex-shrink-0" style={{ width: 300 }}>
        {/* Search */}
        <div className="p-3 border-b border-[#dde1e7]">
          <div className="relative mb-2">
            <Search className="absolute top-1/2 -translate-y-1/2 text-[#858585]" style={{ left: 10, width: 13, height: 13 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or EV number..."
              className="w-full border border-[#dde1e7] rounded focus:outline-none focus:border-[#0060a9] bg-white"
              style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, fontSize: 12 }}
            />
          </div>
          <div className="flex items-center justify-between" style={{ fontSize: 10 }}>
            <span className="text-[#858585]">{evidenceItems.length} item{evidenceItems.length !== 1 ? 's' : ''}</span>
            {checkedIds.size > 0 && (
              <span className="font-black text-[#1E365E]">{checkedIds.size} selected</span>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {evidenceItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-[#858585]">
              <File style={{ width: 32, height: 32 }} className="mb-3 opacity-20" />
              <p className="text-sm font-semibold">No evidence uploaded</p>
              <p className="mt-1" style={{ fontSize: 11 }}>Use Upload Evidence above</p>
            </div>
          )}

          {favourites.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <Star className="text-[#f69139]" fill="currentColor" style={{ width: 12, height: 12 }} />
                <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 10 }}>
                  Favourites
                </span>
                <span className="text-[#858585]" style={{ fontSize: 10 }}>({favourites.length})</span>
              </div>
              <div className="space-y-1">
                {favourites.map(item => (
                  <EvidenceItem
                    key={item.id}
                    item={item}
                    isChecked={checkedIds.has(item.id)}
                    isSelected={selectedEvidenceId === item.id}
                    onSelect={onSelectEvidence}
                    onToggleCheck={onToggleCheck}
                    onToggleFavourite={onToggleFavourite}
                  />
                ))}
              </div>
            </div>
          )}

          {uploads.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <File className="text-[#858585]" style={{ width: 12, height: 12 }} />
                <span className="font-black text-[#252627] uppercase tracking-wider" style={{ fontSize: 10 }}>
                  Uploads
                </span>
                <span className="text-[#858585]" style={{ fontSize: 10 }}>({uploads.length})</span>
              </div>
              <div className="space-y-1">
                {uploads.map(item => (
                  <EvidenceItem
                    key={item.id}
                    item={item}
                    isChecked={checkedIds.has(item.id)}
                    isSelected={selectedEvidenceId === item.id}
                    onSelect={onSelectEvidence}
                    onToggleCheck={onToggleCheck}
                    onToggleFavourite={onToggleFavourite}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Generate Bundle */}
        <div className="p-3 border-t border-[#dde1e7]">
          <button
            onClick={() => checkedIds.size > 0 && setShowBundleModal(true)}
            disabled={checkedIds.size === 0}
            className="w-full py-2.5 bg-[#015165] hover:bg-[#013d4d] disabled:bg-[#dde1e7] disabled:text-[#858585] text-white font-black rounded transition-colors"
            style={{ fontSize: 11 }}
          >
            GENERATE BUNDLE{checkedIds.size > 0 ? ` (${checkedIds.size} ITEMS)` : ''}
          </button>
        </div>
      </div>

      {/* Right panel: Forensic Specifications */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f6f6f6]">
        <div className="px-5 py-3 border-b border-[#dde1e7] bg-white flex items-center gap-2 flex-shrink-0">
          <Shield className="text-[#1E365E]" style={{ width: 14, height: 14 }} />
          <span className="font-black text-[#252627] uppercase tracking-wide" style={{ fontSize: 11 }}>
            Forensic Specifications
          </span>
        </div>
        <div className="flex-1 overflow-hidden">
          <ForensicPanel item={selectedItem} />
        </div>
      </div>

      {/* Bundle name modal */}
      {showBundleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-2xl" style={{ width: 320 }}>
            <h3 className="font-black text-[#252627] mb-1" style={{ fontSize: 14 }}>Name Your Bundle</h3>
            <p className="text-[#858585] mb-4" style={{ fontSize: 11 }}>
              {checkedIds.size} item{checkedIds.size !== 1 ? 's' : ''} will be added
            </p>
            <input
              type="text"
              value={bundleName}
              onChange={e => setBundleName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConfirmBundle()}
              placeholder="e.g. Financial – Lifestyle Bundle"
              autoFocus
              className="w-full border border-[#dde1e7] rounded focus:outline-none focus:border-[#0060a9] mb-4"
              style={{ padding: '8px 12px', fontSize: 13 }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowBundleModal(false)}
                className="flex-1 py-2 border border-[#dde1e7] rounded font-semibold text-[#58595b] hover:bg-[#f6f6f6] transition-colors"
                style={{ fontSize: 12 }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBundle}
                className="flex-1 py-2 bg-[#1E365E] hover:bg-[#2a4a7c] rounded font-black text-white transition-colors"
                style={{ fontSize: 12 }}
              >
                Create Bundle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
