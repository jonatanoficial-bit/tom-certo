import { useEffect, useState, type FormEvent } from 'react';
import { tempoFromTaps } from '../../audio/metronome';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import type { ToastTone } from '../../components/Toast';
import { useMetronome } from '../../hooks/useMetronome';
import { capoShapeForKey, chromaticNotes, transposeProgression } from '../../music-theory/transposition';
import { readLocal, saveLocal } from '../../storage/localStore';

interface ToolsPageProps {
  notify: (message: string, tone?: ToastTone) => void;
}

type ToolTab = 'rhythm' | 'transpose' | 'capo' | 'repertoire';

interface RepertoireEntry {
  id: string;
  title: string;
  key: string;
  capo: number;
  progression: string;
}

const TOOL_TABS: Array<{ id: ToolTab; label: string }> = [
  { id: 'rhythm', label: 'Ritmo' },
  { id: 'transpose', label: 'Cifras' },
  { id: 'capo', label: 'Capo' },
  { id: 'repertoire', label: 'Repertório' },
];

const NOTES = chromaticNotes();

export function ToolsPage({ notify }: ToolsPageProps) {
  const [tab, setTab] = useState<ToolTab>('rhythm');
  const [bpm, setBpm] = useState(96);
  const [beats, setBeats] = useState(4);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const metronome = useMetronome(bpm, beats);
  const [progression, setProgression] = useState('G  D  Em  C');
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [capoKey, setCapoKey] = useState('G');
  const [capo, setCapo] = useState(2);
  const [songTitle, setSongTitle] = useState('');
  const [repertoire, setRepertoire] = useState<RepertoireEntry[]>(() => readLocal<RepertoireEntry[]>('repertoire') ?? []);

  useEffect(() => { saveLocal('repertoire', repertoire); }, [repertoire]);

  const tapTempo = () => {
    const now = performance.now();
    const nextTaps = [...tapTimes.filter((time) => now - time < 8_000), now];
    setTapTimes(nextTaps);
    const detectedTempo = tempoFromTaps(nextTaps);
    if (detectedTempo) setBpm(detectedTempo);
  };

  const addSong = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = songTitle.trim();
    if (!title) return;
    setRepertoire((current) => [{
      id: `${Date.now()}-${title}`,
      title,
      key: capoKey,
      capo,
      progression: transposeProgression(progression, transposeSteps),
    }, ...current]);
    setSongTitle('');
    notify('Música salva apenas neste dispositivo.', 'neutral');
  };

  const removeSong = (id: string) => {
    setRepertoire((current) => current.filter((song) => song.id !== id));
    notify('Música removida do repertório local.', 'neutral');
  };

  const transposedProgression = transposeProgression(progression, transposeSteps);
  const capoShape = capoShapeForKey(capoKey, capo);

  return (
    <section className="tools-page" aria-labelledby="tools-page-title">
      <p className="section-label">FASE 3 · KIT DO MÚSICO</p>
      <h1 id="tools-page-title">Seu kit musical,<br /><em>sem ruído.</em></h1>
      <p className="tools-page__intro">Ferramentas rápidas para manter o pulso, adaptar cifras e preparar o repertório — todas funcionando localmente.</p>

      <div className="tool-tabs" role="tablist" aria-label="Ferramentas musicais">
        {TOOL_TABS.map((item) => (
          <button key={item.id} role="tab" type="button" aria-selected={tab === item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>
        ))}
      </div>

      {tab === 'rhythm' ? (
        <section className="music-tool-panel rhythm-panel" role="tabpanel" aria-label="Metrônomo e Tap Tempo">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="metronome" size={21} /></span><div><p>RITMO</p><h2>Metrônomo</h2></div></div>
          <div className="tempo-display"><span>BPM</span><strong>{bpm}</strong><small>{beats}/4</small></div>
          <div className="beat-lights" aria-label={`${beats} tempos por compasso`}>{Array.from({ length: beats }, (_, index) => <span key={index} className={metronome.isPlaying && metronome.activeBeat === index ? 'is-active' : ''} />)}</div>
          <label className="range-label" htmlFor="tempo-range"><span>35</span><input id="tempo-range" type="range" min="35" max="240" value={bpm} onChange={(event) => setBpm(Number(event.target.value))} /><span>240</span></label>
          <div className="tool-control-row"><button type="button" aria-label="Diminuir BPM" onClick={() => setBpm((value) => Math.max(35, value - 1))}>−</button><button className="tap-button" type="button" onClick={tapTempo}>TAP<br /><small>TEMPO</small></button><button type="button" aria-label="Aumentar BPM" onClick={() => setBpm((value) => Math.min(240, value + 1))}>+</button></div>
          <div className="beat-selector" aria-label="Fórmula de compasso">{[2, 3, 4, 6].map((value) => <button key={value} type="button" className={beats === value ? 'is-active' : ''} onClick={() => setBeats(value)}>{value}/4</button>)}</div>
          <Button variant="primary" icon={metronome.isPlaying ? 'stop' : 'metronome'} onClick={() => { if (metronome.isPlaying) metronome.stop(); else void metronome.start(); }}>{metronome.isPlaying ? 'PARAR METRÔNOMO' : 'INICIAR METRÔNOMO'}</Button>
          {metronome.error ? <p className="tool-error" role="status">{metronome.error}</p> : null}
        </section>
      ) : null}

      {tab === 'transpose' ? (
        <section className="music-tool-panel" role="tabpanel" aria-label="Transpositor de cifras">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="transpose" size={21} /></span><div><p>CIFRAS</p><h2>Transpor sem travar</h2></div></div>
          <label className="field-label" htmlFor="progression">PROGRESSÃO ORIGINAL</label>
          <input id="progression" className="music-input" value={progression} onChange={(event) => setProgression(event.target.value)} placeholder="Ex.: G D Em C" />
          <div className="transpose-controls"><button type="button" onClick={() => setTransposeSteps((value) => value - 1)}>−</button><div><span>DESLOCAMENTO</span><strong>{transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps} semitom{Math.abs(transposeSteps) === 1 ? '' : 's'}</strong></div><button type="button" onClick={() => setTransposeSteps((value) => value + 1)}>+</button></div>
          <div className="progression-result"><span>RESULTADO</span><strong>{transposedProgression || 'Digite as cifras acima'}</strong></div>
          <p className="tool-note">Preserva acordes menores, extensões e baixos como <code>G/B</code>.</p>
        </section>
      ) : null}

      {tab === 'capo' ? (
        <section className="music-tool-panel" role="tabpanel" aria-label="Calculadora de capotraste">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="transpose" size={21} /></span><div><p>VIOLÃO</p><h2>Capo sem tentativa</h2></div></div>
          <div className="two-fields"><label className="field-label" htmlFor="capo-key">TOM DESEJADO<select id="capo-key" value={capoKey} onChange={(event) => setCapoKey(event.target.value)}>{NOTES.map((note) => <option key={note}>{note}</option>)}</select></label><label className="field-label" htmlFor="capo-fret">CASA DO CAPO<select id="capo-fret" value={capo} onChange={(event) => setCapo(Number(event.target.value))}>{Array.from({ length: 8 }, (_, value) => <option key={value} value={value}>{value === 0 ? 'Sem capo' : `${value}ª casa`}</option>)}</select></label></div>
          <div className="capo-result"><span>FORMA PARA TOCAR</span><strong>{capoShape ?? '—'}</strong><p>{capo === 0 ? 'Você pode tocar diretamente no tom desejado.' : `Com o capo na ${capo}ª casa, use a forma de ${capoShape}.`}</p></div>
          <p className="tool-note">O cálculo mostra a forma-base; as cifras podem ser transpostas na aba anterior.</p>
        </section>
      ) : null}

      {tab === 'repertoire' ? (
        <section className="music-tool-panel" role="tabpanel" aria-label="Repertório local">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="clock" size={21} /></span><div><p>REPERTÓRIO</p><h2>Próxima música</h2></div></div>
          <form className="repertoire-form" onSubmit={addSong}><label className="field-label" htmlFor="song-title">NOME DA MÚSICA<input id="song-title" className="music-input" value={songTitle} onChange={(event) => setSongTitle(event.target.value)} placeholder="Ex.: Teu Amor Não Falha" /></label><Button variant="secondary" icon="arrow" type="submit">SALVAR NO REPERTÓRIO</Button></form>
          {repertoire.length ? <ul className="repertoire-list">{repertoire.map((song) => <li key={song.id}><div><strong>{song.title}</strong><span>{song.key} · {song.capo ? `capo ${song.capo}` : 'sem capo'} · {song.progression}</span></div><button type="button" aria-label={`Remover ${song.title}`} onClick={() => removeSong(song.id)}>×</button></li>)}</ul> : <p className="empty-repertoire">Seu repertório fica guardado neste dispositivo. Salve a primeira música quando estiver pronto.</p>}
        </section>
      ) : null}

      <p className="tools-page__next"><Icon name="tuner" size={15} /> Afinador com leitura de nota é o próximo marco desta fase.</p>
    </section>
  );
}
