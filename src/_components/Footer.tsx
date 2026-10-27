export default function Footer({}) {
  return (
    <footer data-cy="footer" className="border-t pt-6 mt-12 left-0">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground container mx-auto xl:px-0 px-8">
        <div className="flex items-center gap-4">
          <p>&copy; 2025 MARLIN - Maritime Low-earth-orbit Insight Network</p>
        </div>

        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-ocean-blue transition-colors">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-ocean-blue transition-colors">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-ocean-blue transition-colors">Support</a>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-center">
        <p className="text-xs text-muted-foreground">
          System Status: <span className="text-sea-green">Operational</span> |
          Last Data Sync: <span className="text-ocean-blue">2 minutes ago</span>
        </p>
      </div>
    </footer>
  );
}
