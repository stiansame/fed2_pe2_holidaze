import Logo from '../Logo.jsx';

export default function Footer() {
  return (
    <footer className="border-t-4 border-accent bg-accent/10">
      <div className="mx-auto max-w-360 p-6 md:p-12">
        <div className="space-y-4 border-t border-border pt-4">
          <Logo />
          <p className="text-small text-muted">Find somewhere worth staying.</p>
          <p className="text-caption text-muted">© Stian Rostad 2026 | Noroff FED2 | PE2</p>
        </div>
      </div>
    </footer>
  );
}
