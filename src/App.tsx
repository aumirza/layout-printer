
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CollageProvider } from './context/CollageContext';
import { Toaster } from './components/toaster';
import { ThemeProvider } from './providers/ThemeProvider';
import Index from './pages/Index';
import Editor from './pages/Editor';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <CollageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </CollageProvider>
    </ThemeProvider>
  );
}

export default App;
