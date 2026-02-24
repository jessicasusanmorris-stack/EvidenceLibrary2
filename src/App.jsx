import { useState, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LibraryPage from './pages/LibraryPage';
import BundleBuilderPage from './pages/BundleBuilderPage';
import {
  getFileType,
  generateEvNumber,
  computeHash,
  createPreviewUrl,
  generateId,
} from './utils/evidenceUtils';

const MATTER = { name: 'Smith & Smith', number: '7729' };
const USER = { name: 'Sarah Jenkins', role: 'Principal Solicitor' };

export default function App() {
  const [activePage, setActivePage] = useState('library');
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  const [selectedBundleId, setSelectedBundleId] = useState(null);
  const evCounterRef = useRef(1);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const newItems = await Promise.all(
      files.map(async (file) => {
        const id = generateId();
        const evNumber = generateEvNumber(evCounterRef.current++, MATTER.number);
        const fileType = getFileType(file);
        const previewUrl = createPreviewUrl(file);

        // Start hash computation — update item when done
        const hashPromise = computeHash(file);

        const item = {
          id,
          evNumber,
          name: file.name,
          file,
          fileType,
          previewUrl,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          hash: null,
          hashPending: true,
          checked: false,
          favourite: false,
        };

        // Resolve hash and update state asynchronously
        hashPromise.then((hash) => {
          setEvidenceItems((prev) =>
            prev.map((it) => (it.id === id ? { ...it, hash, hashPending: false } : it))
          );
        });

        return item;
      })
    );

    setEvidenceItems((prev) => {
      const updated = [...prev, ...newItems];
      // Auto-select first uploaded item if none selected
      if (!selectedEvidenceId && newItems.length > 0) {
        setSelectedEvidenceId(newItems[0].id);
      }
      return updated;
    });
  }, [selectedEvidenceId]);

  // ── Library interactions ─────────────────────────────────────────────────────
  const handleToggleCheck = useCallback((id) => {
    setEvidenceItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it))
    );
  }, []);

  const handleToggleFavourite = useCallback((id) => {
    setEvidenceItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, favourite: !it.favourite } : it))
    );
  }, []);

  const handleSelectEvidence = useCallback((id) => {
    setSelectedEvidenceId(id);
  }, []);

  // ── Generate bundle from checked items ──────────────────────────────────────
  const handleGenerateBundle = useCallback((bundleName) => {
    const checkedIds = evidenceItems.filter((it) => it.checked).map((it) => it.id);
    if (checkedIds.length === 0) return;

    const newBundle = {
      id: generateId(),
      name: bundleName || `Bundle ${bundles.length + 1}`,
      itemIds: checkedIds,
      authorisedBy: [],
      settings: {
        showIndex: true,
        showCertification: false,
        showProvenance: false,
      },
      createdAt: new Date().toISOString(),
    };

    setBundles((prev) => [...prev, newBundle]);
    setSelectedBundleId(newBundle.id);

    // Uncheck all items
    setEvidenceItems((prev) => prev.map((it) => ({ ...it, checked: false })));

    // Navigate to bundle builder
    setActivePage('bundle-builder');
  }, [evidenceItems, bundles.length]);

  // ── Bundle interactions ──────────────────────────────────────────────────────
  const handleCreateBundle = useCallback(() => {
    const newBundle = {
      id: generateId(),
      name: `Bundle ${bundles.length + 1}`,
      itemIds: [],
      authorisedBy: [],
      settings: {
        showIndex: true,
        showCertification: false,
        showProvenance: false,
      },
      createdAt: new Date().toISOString(),
    };
    setBundles((prev) => [...prev, newBundle]);
    setSelectedBundleId(newBundle.id);
  }, [bundles.length]);

  const handleSelectBundle = useCallback((id) => {
    setSelectedBundleId(id);
  }, []);

  const handleRemoveFromBundle = useCallback((bundleId, itemId) => {
    setBundles((prev) =>
      prev.map((b) =>
        b.id === bundleId
          ? { ...b, itemIds: b.itemIds.filter((id) => id !== itemId) }
          : b
      )
    );
  }, []);

  const handleUpdateBundleName = useCallback((bundleId, name) => {
    setBundles((prev) =>
      prev.map((b) => (b.id === bundleId ? { ...b, name } : b))
    );
  }, []);

  const handleUpdateSettings = useCallback((bundleId, key, value) => {
    setBundles((prev) =>
      prev.map((b) =>
        b.id === bundleId
          ? { ...b, settings: { ...b.settings, [key]: value } }
          : b
      )
    );
  }, []);

  const handleUpdateAuthorisedBy = useCallback((bundleId, names) => {
    setBundles((prev) =>
      prev.map((b) => (b.id === bundleId ? { ...b, authorisedBy: names } : b))
    );
  }, []);

  const handleDeleteBundle = useCallback((bundleId) => {
    setBundles((prev) => {
      const next = prev.filter((b) => b.id !== bundleId);
      if (selectedBundleId === bundleId) {
        setSelectedBundleId(next.length > 0 ? next[next.length - 1].id : null);
      }
      return next;
    });
  }, [selectedBundleId]);

  // ── Render ───────────────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (activePage) {
      case 'library':
        return (
          <LibraryPage
            evidenceItems={evidenceItems}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={handleSelectEvidence}
            onToggleCheck={handleToggleCheck}
            onToggleFavourite={handleToggleFavourite}
            onGenerateBundle={handleGenerateBundle}
          />
        );
      case 'bundle-builder':
        return (
          <BundleBuilderPage
            bundles={bundles}
            evidenceItems={evidenceItems}
            selectedBundleId={selectedBundleId}
            onSelectBundle={handleSelectBundle}
            onCreateBundle={handleCreateBundle}
            onRemoveFromBundle={handleRemoveFromBundle}
            onUpdateBundleName={handleUpdateBundleName}
            onUpdateSettings={handleUpdateSettings}
            onUpdateAuthorisedBy={handleUpdateAuthorisedBy}
            onDeleteBundle={handleDeleteBundle}
            matter={MATTER}
          />
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-[#858585] text-sm">
            <div className="text-center">
              <div className="text-4xl mb-3">🚧</div>
              <div className="font-semibold">Coming Soon</div>
              <div className="text-xs mt-1">This section is under development</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f9]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        matter={MATTER}
        user={USER}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          matter={MATTER}
          user={USER}
          onUpload={handleUpload}
        />
        <div className="flex-1 overflow-hidden flex">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
