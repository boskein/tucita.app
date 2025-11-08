import { Button } from '@/components/ui/button';

export default function Navbar() {
  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Tucitas.app</h1>
        </div>
        <Button onClick={handleGetStarted} className="ml-auto">
          Empieza gratis
        </Button>
      </div>
    </nav>
  );
}
