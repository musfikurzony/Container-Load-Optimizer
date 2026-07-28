import { useMemo, useRef, useState } from 'react';
import { Box, GitCompare, LayoutGrid, Save, Table2 } from 'lucide-react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { KpiCards } from './components/KpiCards';
import { OrientationTable } from './components/OrientationTable';
import { CbmMethodPanel, MixedOrientationPanel, WeightPanel } from './components/DetailPanels';
import { ChartsPanel } from './components/ChartsPanel';
import { Container3D } from './components/Container3D';
import { OrderPlanner } from './components/OrderPlanner';
import { FreightPanel } from './components/FreightPanel';
import { ProjectsPanel } from './components/ProjectsPanel';
import { ComparisonTool } from './components/ComparisonTool';
import { ExportBar } from './components/ExportBar';
import { useTheme } from './lib/useTheme';
import { runFullCalculation } from './engine/calculationEngine';
import { getContainer } from './data/containers';
import type { CartonInput, SavedProject, Unit } from './types';

type Tab = 'overview' | 'table' | '3d' | 'compare' | 'projects';

const TABS: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'table', label: 'Orientation Table', icon: Table2 },
  { id: '3d', label: '3D View', icon: Box },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'projects', label: 'Projects', icon: Save },
];

function App() {
  const { theme, toggleTheme } = useTheme();
  const [unit, setUnit] = useState<Unit>('cm');
  const [containerId, setContainerId] = useState('40HQ');
  const [loadingFactorPct, setLoadingFactorPct] = useState(90);
  const [carton, setCarton] = useState<CartonInput>({
    lengthCm: 60,
    widthCm: 40,
    heightCm: 35,
    piecesPerCarton: 24,
    weightPerCartonKg: 12,
  });
  const [tab, setTab] = useState<Tab>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const dashboardRef = useRef<HTMLDivElement>(null);

  const container = getContainer(containerId);
  const result = useMemo(
    () => runFullCalculation(container, carton, loadingFactorPct),
    [container, carton, loadingFactorPct]
  );

  const handleLoadProject = (p: SavedProject) => {
    setContainerId(p.containerId);
    setUnit(p.unit);
    setLoadingFactorPct(p.loadingFactorPct);
    setCarton(p.carton);
    setTab('overview');
  };

  return (
    <div className="h-full flex flex-col bg-canvas-light dark:bg-canvas text-text-primary-light dark:text-text-primary">
      <Header unit={unit} onUnitChange={setUnit} theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[320px] shrink-0 border-r border-border-soft-light dark:border-border-soft overflow-y-auto p-4">
          <InputPanel
            containerId={containerId}
            onContainerChange={setContainerId}
            unit={unit}
            carton={carton}
            onCartonChange={setCarton}
            loadingFactorPct={loadingFactorPct}
            onLoadingFactorChange={setLoadingFactorPct}
          />
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-border-soft-light dark:border-border-soft bg-canvas-light/90 dark:bg-canvas/90 backdrop-blur">
            <nav className="flex items-center gap-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    tab === id
                      ? 'bg-accent text-white'
                      : 'text-text-muted-light dark:text-text-muted hover:bg-border-soft-light/60 dark:hover:bg-border-soft/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </nav>
            <ExportBar targetRef={dashboardRef} result={result} />
          </div>

          <div ref={dashboardRef} className="p-6 space-y-4">
            {tab === 'overview' && (
              <>
                <KpiCards result={result} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <MixedOrientationPanel result={result} />
                  <CbmMethodPanel result={result} />
                  <WeightPanel result={result} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <OrderPlanner result={result} />
                  <FreightPanel result={result} />
                </div>
                <ChartsPanel result={result} />
              </>
            )}

            {tab === 'table' && (
              <>
                <OrientationTable result={result} />
                <p className="text-xs text-text-muted-light dark:text-text-muted">
                  The mixed-orientation optimizer (see Overview tab) fills leftover gaps after this base grid using rotated
                  cartons, then applies your loading factor — it's a loading estimate, not a guaranteed mathematical
                  optimum.
                </p>
              </>
            )}

            {tab === '3d' && <Container3D result={result} theme={theme} />}

            {tab === 'compare' && (
              <ComparisonTool container={container} unit={unit} baseCarton={carton} loadingFactorPct={loadingFactorPct} />
            )}

            {tab === 'projects' && (
              <ProjectsPanel
                containerId={containerId}
                unit={unit}
                carton={carton}
                loadingFactorPct={loadingFactorPct}
                onLoad={handleLoadProject}
                refreshKey={refreshKey}
                bumpRefresh={() => setRefreshKey((k) => k + 1)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
