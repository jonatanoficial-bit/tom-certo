import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import type { ToastTone } from '../../components/Toast';

interface HomePageProps {
  notify: (message: string, tone?: ToastTone) => void;
}

const upcomingTools = [
  { title: 'Metrônomo', detail: 'Pulse no tempo certo', icon: 'metronome' as const },
  { title: 'Afinador', detail: 'Encontre sua nota', icon: 'tuner' as const },
  { title: 'Transpor', detail: 'Mude sem complicar', icon: 'transpose' as const },
];

export function HomePage({ notify }: HomePageProps) {
  const showLoteTwoMessage = () => {
    notify('A escuta com microfone chega no Lote 2. Hoje, você está vendo a fundação do Tom Certo.', 'warm');
  };

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__eyebrow"><span /> ASSISTENTE MUSICAL INTELIGENTE</div>
        <h1 id="hero-title">Qual é<br /><em>o tom?</em></h1>
        <p className="hero__intro">Cante, toque ou reproduza uma música. O Tom Certo mostra para onde ela quer chegar.</p>

        <div className="signal-card" aria-label="Tom Certo pronto para ouvir">
          <div className="signal-card__glow" aria-hidden="true" />
          <div className="signal-card__topline">
            <span className="live-dot" aria-hidden="true" />
            <span>PRONTO PARA OUVIR</span>
            <span className="signal-card__line" aria-hidden="true" />
            <span>01</span>
          </div>
          <div className="signal-orbit" aria-hidden="true">
            <span className="signal-orbit__ring signal-orbit__ring--one" />
            <span className="signal-orbit__ring signal-orbit__ring--two" />
            <span className="signal-orbit__core"><Icon name="mic" size={25} /></span>
            <span className="signal-orbit__pulse" />
          </div>
          <p>Quando a escuta começar, seu som vai ganhar forma aqui.</p>
        </div>

        <div className="hero__actions">
          <Button variant="primary" icon="mic" onClick={showLoteTwoMessage}>OUVIR AGORA</Button>
          <Button variant="secondary" icon="upload" onClick={showLoteTwoMessage}>Enviar áudio</Button>
        </div>
        <p className="hero__privacy"><Icon name="shield" size={14} /> Seu áudio permanece no seu dispositivo.</p>
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

      <section className="tool-preview" aria-labelledby="tools-title">
        <div className="section-heading">
          <div>
            <p className="section-label">NO SEU RITMO</p>
            <h2 id="tools-title">Ferramentas musicais</h2>
          </div>
          <span className="planned-badge">EM BREVE</span>
        </div>
        <div className="tool-list">
          {upcomingTools.map((tool) => (
            <button key={tool.title} className="tool-item" type="button" onClick={() => notify(`${tool.title} será habilitado nos próximos lotes.`, 'neutral')}>
              <span className="tool-item__icon"><Icon name={tool.icon} size={22} /></span>
              <span className="tool-item__copy"><strong>{tool.title}</strong><small>{tool.detail}</small></span>
              <Icon name="chevron" size={18} />
            </button>
          ))}
        </div>
      </section>

      <footer className="app-footer">
        <span>TOM CERTO</span><i /> <span>v0.1.0 · Build 0100</span>
      </footer>
    </>
  );
}
