
import { Settings, SunIcon, MoonIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Link } from 'react-router-dom';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useState } from 'react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <header className="border-b bg-background p-2 flex justify-between items-center">
      <div className="flex items-center">
        <Link to="/" className="font-semibold text-lg hover:text-primary transition-colors">
          Photo Collage Maker
        </Link>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      <SettingsDialog 
        open={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </header>
  );
}
