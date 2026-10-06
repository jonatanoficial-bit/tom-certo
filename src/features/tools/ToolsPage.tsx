import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import type { ToastTone } from '../../components/Toast';

interface ToolsPageProps {
  notify: (message: string, tone?: ToastTone) => void;
}

export function ToolsPage({ notify }: ToolsPageProps) {
  return (
    <section className="tools-page" aria-labelledby="tools-page-title">
      <p className="section-label">EM CONSTRUÇÃO</p>
      <h1 id="tools-page-title">Seu kit musical,<br /><em>sem ruído.</em></h1>
      <p className="tools-page__intro">Metrônomo, afinador e transposição vêm a seguir, no mesmo ritmo de uma experiência simples e precisa.</p>
      <div className="coming-soon-panel">
        <span className="coming-soon-panel__orb"><Icon name="grid" size={28} /></span>
        <div>
          <strong>Próxima frequência</strong>
          <p>O núcleo de escuta chega no Lote 2.</p>
        </div>
      </div>
      <Button variant="secondary" icon="arrow" onClick={() => notify('Acompanhe o ROADMAP.md para ver a sequência dos lotes.', 'neutral')}>Ver roadmap</Button>
    </section>
  );
}
