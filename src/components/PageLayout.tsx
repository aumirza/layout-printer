
import React from 'react';

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container">
          <h1 className="text-2xl font-bold">Photo Collage Generator</h1>
          <p className="text-sm opacity-90">Create printable photo collages with custom layouts</p>
        </div>
      </header>
      
      <main className="container flex-1 py-8">
        {children}
      </main>
      
      <footer className="bg-muted py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>Photo Collage Generator &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
