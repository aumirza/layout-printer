
import { PageLayout } from './components/PageLayout';
import { CollageProvider } from './context/CollageContext';
import { CollageApp } from './components/CollageApp';
import { Toaster } from './components/toaster';
import { pageSizes } from './data/page-sizes';
import { layoutPresets } from './data/layout-presets';

function App() {
  return (
    <CollageProvider>
      <PageLayout>
        <CollageApp />
        <Toaster />
      </PageLayout>
    </CollageProvider>
  );
}

export default App;
