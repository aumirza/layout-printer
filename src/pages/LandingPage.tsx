
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InitialSetupModal } from '@/components/InitialSetupModal';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

export default function LandingPage() {
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const handleSetupComplete = (settings: any) => {
    // Store settings in localStorage
    localStorage.setItem('collageSettings', JSON.stringify(settings));
    // Navigate to the collage editor
    navigate('/editor');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Picture Perfect Photo Collage Maker
        </h1>
        
        <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
          Create beautiful photo collages perfect for printing. Arrange your photos in a grid,
          customize layouts, and export in high resolution for printing.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Upload Photos</h3>
            <p className="text-muted-foreground text-sm">
              Drag and drop your photos into the collage maker and easily organize them.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0-6h20a3 3 0 0 1 0 6v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" />
                <path d="M13 14v-4" />
                <path d="M17 14v-4" />
                <path d="M9 14v-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Customize Layout</h3>
            <p className="text-muted-foreground text-sm">
              Choose from standard page sizes and photo dimensions or create your own custom layout.
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Print & Export</h3>
            <p className="text-muted-foreground text-sm">
              Export high-quality PDFs and images or send directly to your printer.
            </p>
          </div>
        </div>
        
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg"
          onClick={() => navigate('/editor')}
        >
          Continue to Playground
        </Button>
      </div>
      
      <footer className="mt-24 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Photo Collage Maker. All rights reserved.</p>
      </footer>
    </div>
  );
}
