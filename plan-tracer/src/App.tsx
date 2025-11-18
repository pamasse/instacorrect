import { useRef, useEffect } from 'react';
import { useStore } from './store/useStore';
import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { LibraryPanel } from './components/LibraryPanel/LibraryPanel';
import { QuantityPanel } from './components/QuantityPanel/QuantityPanel';
import { ScaleCalibration } from './components/ScaleCalibration/ScaleCalibration';
import { GridSettings } from './components/GridSettings/GridSettings';
import { loadBackgroundFile, downloadJSON } from './utils/fileImport';
import './App.css';

/**
 * Composant principal de l'application
 */
function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    projectName,
    setProjectName,
    setBackgroundImage,
    exportJSON,
    reset,
    setActiveTool,
  } = useStore();

  /**
   * Gestion de l'import de fichier
   */
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageData = await loadBackgroundFile(file);
      setBackgroundImage(imageData);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors du chargement du fichier');
    }

    // Réinitialiser l'input pour permettre de charger le même fichier à nouveau
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Export JSON
   */
  const handleExport = () => {
    const jsonData = exportJSON();
    const filename = `${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(jsonData, filename);
  };

  /**
   * Raccourcis clavier
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est dans un input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'w':
          setActiveTool('wall');
          break;
        case 'm':
          setActiveTool('mex');
          break;
        case 't':
          setActiveTool('room-tag');
          break;
        case 'c':
          setActiveTool('calibrate');
          break;
        case 'h':
          setActiveTool('pan');
          break;
        case 'escape':
          setActiveTool('select');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>Plan Tracer</h1>
          <input
            type="text"
            className="project-name-input"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Nom du projet"
          />
        </div>
        <div className="header-actions">
          <button className="header-button" onClick={() => fileInputRef.current?.click()}>
            📁 Importer plan
          </button>
          <button className="header-button export" onClick={handleExport}>
            💾 Exporter JSON
          </button>
          <button className="header-button danger" onClick={reset}>
            🗑 Réinitialiser
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg"
          onChange={handleFileImport}
          style={{ display: 'none' }}
        />
      </header>

      {/* Layout principal */}
      <div className="app-layout">
        {/* Toolbar gauche */}
        <aside className="sidebar-left">
          <Toolbar />
          <div className="sidebar-settings">
            <ScaleCalibration />
            <GridSettings />
          </div>
        </aside>

        {/* Zone centrale avec canvas */}
        <main className="main-content">
          <Canvas />
          <footer className="footer">
            <QuantityPanel />
          </footer>
        </main>

        {/* Panneau droit */}
        <aside className="sidebar-right">
          <LibraryPanel />
        </aside>
      </div>
    </div>
  );
}

export default App;
