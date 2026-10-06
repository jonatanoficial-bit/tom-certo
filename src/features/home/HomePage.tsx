import { Icon } from '../../components/Icon';
import { ListeningPanel } from '../listening/ListeningPanel';

interface HomePageProps {
  guided: boolean;
  onOpenTools: () => void;
}

const upcomingTools = [
  { title: 'Metrônomo', detail: 'Pulse no tempo certo', icon: 'metronome' as const },
  { title: 'Afinador', detail: 'Encontre sua nota', icon: 'tuner' as const },
  { title: 'Transpor', detail: 'Mude sem complicar', icon: 'transpose' as const },
];

export function HomePage({ guided, onOpenTools }: HomePageProps) {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <span className="hero__edition" aria-hidden="true">01 — TONALIDADE</span>
        <div className="hero__sound-lines" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="hero__eyebrow"><span /> ASSISTENTE MUSICAL INTELIGENTE</div>
        <h1 id="hero-title">Qual é<br /><em>o tom?</em></h1>
        <p className="hero__intro">Cante, toque ou reproduza uma música. O Tom Certo mostra para onde ela quer chegar.</p>

        <ListeningPanel />
      </section>

      <section className="promise" aria-label="A promessa do Tom Certo">
        <p className="section-label">DO SOM À CLAREZA</p>
        <div className="promise__copy">
          <h2>Menos adivinhação.<br /><span>Mais música.</span></h2>
          <p>Uma experiência direta para descobrir o tom e seguir tocando — mesmo que você nunca tenha estudado teoria.</p>
        </div>
        <div className="steps" aria-label="Como funciona">
          <div className="step"><span>01</span><p>Ouça</p></div>
          <div className="step"><span>02</span><p>Descubra</p></div>
          <div className="step"><span>03</span><p>Toque</p></div>
        </div>
      </section>

      {guided ? (
        <section className="guided-card" aria-labelledby="guided-title">
          <div>
            <p className="section-label">MODO INICIANTE</p>
            <h2 id="guided-title">Comece em<br /><span>três passos.</span></h2>
          </div>
          <ol>
            <li><span>1</span><p><strong>Faça uma leitura</strong> — cante ou toque um trecho com som limpo.</p></li>
            <li><span>2</span><p><strong>Olhe a evidência tonal</strong> — a porcentagem explica a qualidade daquela leitura.</p></li>
            <li><span>3</span><p><strong>Prepare a música</strong> — use ritmo, cifras, capo ou repertório.</p></li>
          </ol>
          <button className="guided-card__action" type="button" onClick={onOpenTools}>ABRIR FERRAMENTAS <Icon name="arrow" size={16} /></button>
        </section>
      ) : null}

      <section className="tool-preview" aria-labelledby="tools-title">
        <div className="section-heading">
          <div>
            <p className="section-label">NO SEU RITMO</p>
            <h2 id="tools-title">Ferramentas musicais</h2>
          </div>
          <button className="planned-badge" type="button" onClick={onOpenTools}>ABRIR KIT</button>
        </div>
        <div className="tool-list">
          {upcomingTools.map((tool) => (
            <button key={tool.title} className="tool-item" type="button" onClick={onOpenTools}>
              <span className="tool-item__icon"><Icon name={tool.icon} size={22} /></span>
              <span className="tool-item__copy"><strong>{tool.title}</strong><small>{tool.detail}</small></span>
              <Icon name="chevron" size={18} />
            </button>
          ))}
        </div>
      </section>

      <footer className="app-footer">
        <span>TOM CERTO</span><i /> <span>v0.4.0 · Build 0400</span>
      </footer>
    </>
  );
}
