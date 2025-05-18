
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PageLayout } from './components/PageLayout';
import { CollageProvider } from './context/CollageContext';
import { Toaster } from './components/toaster';
import Index from './pages/Index';
import Editor from './pages/Editor';
import NotFound from './pages/NotFound';

function App() {
  return (
    <CollageProvider>
      <Router>
        <PageLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </PageLayout>
      </Router>
    </CollageProvider>
  );
}

export default App;
