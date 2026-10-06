import { useEffect, useState, type FormEvent } from 'react';
import { tempoFromTaps } from '../../audio/metronome';
import { tuningDirection } from '../../audio/pitchDetector';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import type { ToastTone } from '../../components/Toast';
import { useMetronome } from '../../hooks/useMetronome';
import { useTuner } from '../../hooks/useTuner';
import { capoShapeForKey, chromaticNotes, transposeProgression } from '../../music-theory/transposition';
import { readLocal, saveLocal } from '../../storage/localStore';

interface ToolsPageProps {
  notify: (message: string, tone?: ToastTone) => void;
  guided: boolean;
}

type ToolTab = 'rhythm' | 'tuner' | 'transpose' | 'capo' | 'repertoire' | 'worship';

interface RepertoireEntry {
  id: string;
  title: string;
  key: string;
  capo: number;
  progression: string;
}

const TOOL_TABS: Array<{ id: ToolTab; label: string }> = [
  { id: 'rhythm', label: 'Ritmo' },
  { id: 'tuner', label: 'Afinador' },
  { id: 'transpose', label: 'Cifras' },
  { id: 'capo', label: 'Capo' },
  { id: 'repertoire', label: 'Repertório' },
  { id: 'worship', label: 'Culto' },
];

const NOTES = chromaticNotes();

export function ToolsPage({ notify, guided }: ToolsPageProps) {
  const [tab, setTab] = useState<ToolTab>('rhythm');
  const [bpm, setBpm] = useState(96);
  const [beats, setBeats] = useState(4);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const metronome = useMetronome(bpm, beats);
  const tuner = useTuner();
  const [progression, setProgression] = useState('G  D  Em  C');
  const [transposeSteps, setTransposeSteps] = useState(0);
  const [capoKey, setCapoKey] = useState('G');
  const [capo, setCapo] = useState(2);
  const [songTitle, setSongTitle] = useState('');
  const [repertoire, setRepertoire] = useState<RepertoireEntry[]>(() => readLocal<RepertoireEntry[]>('repertoire') ?? []);
  const [worshipSongId, setWorshipSongId] = useState(() => readLocal<string>('worship-current') ?? '');
  const [isWorshipPresentation, setIsWorshipPresentation] = useState(false);

  useEffect(() => { saveLocal('repertoire', repertoire); }, [repertoire]);
  useEffect(() => { saveLocal('worship-current', worshipSongId); }, [worshipSongId]);

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
    const song = {
      id: `${Date.now()}-${title}`,
      title,
      key: capoKey,
      capo,
      progression: transposeProgression(progression, transposeSteps),
    };
    setRepertoire((current) => [song, ...current]);
    if (!worshipSongId) setWorshipSongId(song.id);
    setSongTitle('');
    notify('Música salva apenas neste dispositivo.', 'neutral');
  };

  const removeSong = (id: string) => {
    setRepertoire((current) => current.filter((song) => song.id !== id));
    if (worshipSongId === id) setWorshipSongId('');
    notify('Música removida do repertório local.', 'neutral');
  };

  const transposedProgression = transposeProgression(progression, transposeSteps);
  const capoShape = capoShapeForKey(capoKey, capo);
  const worshipSong = repertoire.find((song) => song.id === worshipSongId) ?? repertoire[0] ?? null;
  const tunerDirection = tuner.reading ? tuningDirection(tuner.reading.cents) : null;
  const tunerPosition = tuner.reading ? Math.max(4, Math.min(96, 50 + tuner.reading.cents)) : 50;

  const selectTab = (nextTab: ToolTab) => {
    if (tab === 'tuner' && nextTab !== 'tuner') void tuner.stop();
    setTab(nextTab);
  };

  return (
    <section className="tools-page" aria-labelledby="tools-page-title">
      <p className="section-label">FASE 4 · PRONTO PARA TOCAR</p>
      <h1 id="tools-page-title">Seu kit musical,<br /><em>sem ruído.</em></h1>
      <p className="tools-page__intro">Ferramentas rápidas para manter o pulso, adaptar cifras e preparar o repertório — todas funcionando localmente.</p>
      {guided ? <p className="tools-page__guide"><Icon name="spark" size={15} /> Comece por <strong>Ritmo</strong>, depois use <strong>Cifras</strong> ou <strong>Capo</strong>. No final, deixe a próxima música pronta em <strong>Culto</strong>.</p> : null}

      <div className="tool-tabs" role="tablist" aria-label="Ferramentas musicais">
        {TOOL_TABS.map((item) => (
          <button key={item.id} id={`tool-tab-${item.id}`} role="tab" type="button" aria-selected={tab === item.id} aria-controls={`tool-panel-${item.id}`} className={tab === item.id ? 'is-active' : ''} onClick={() => selectTab(item.id)}>{item.label}</button>
        ))}
      </div>

      {tab === 'rhythm' ? (
        <section id="tool-panel-rhythm" className="music-tool-panel rhythm-panel" role="tabpanel" aria-labelledby="tool-tab-rhythm">
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

      {tab === 'tuner' ? (
        <section id="tool-panel-tuner" className="music-tool-panel tuner-panel" role="tabpanel" aria-labelledby="tool-tab-tuner">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="tuner" size={21} /></span><div><p>AFINADOR LOCAL</p><h2>Encontre sua nota</h2></div></div>
          <p className="tuner-panel__intro">Use uma nota por vez. A leitura fica no seu dispositivo e não grava seu áudio.</p>
          <div className={`tuner-readout ${tunerDirection ? `is-${tunerDirection}` : ''}`} aria-live="polite" aria-label={tuner.reading ? `Nota ${tuner.reading.note}${tuner.reading.octave}, ${tuner.reading.cents} cents` : 'Aguardando uma nota'}>
            <div className="tuner-readout__orbit" aria-hidden="true"><i /><i /><i /></div>
            <span className="tuner-readout__label">NOTA</span>
            <strong>{tuner.reading?.note ?? '—'}<sup>{tuner.reading ? tuner.reading.octave : ''}</sup></strong>
            <small>{tuner.reading ? `${Math.round(tuner.reading.frequency)} Hz` : 'OUVINDO O SILÊNCIO'}</small>
          </div>
          <div className="tuner-meter" aria-label={tuner.reading ? `${tuner.reading.cents} cents em relação à afinação` : 'Medidor de afinação'}>
            <span>−50</span><div className="tuner-meter__track"><i style={{ left: `${tunerPosition}%` }} /></div><span>+50</span>
          </div>
          <p className={`tuner-direction ${tunerDirection ? `is-${tunerDirection}` : ''}`}>{tunerDirection === 'flat' ? `SUBA ${Math.abs(tuner.reading?.cents ?? 0)} CENTS` : tunerDirection === 'sharp' ? `DESÇA ${Math.abs(tuner.reading?.cents ?? 0)} CENTS` : tunerDirection === 'in-tune' ? 'AFINADO' : 'TOQUE UMA NOTA SUSTENTADA'}</p>
          <Button variant="primary" icon={tuner.phase === 'listening' ? 'stop' : 'tuner'} disabled={tuner.phase === 'requesting-permission'} onClick={() => { if (tuner.phase === 'listening') void tuner.stop(); else void tuner.start(); }}>{tuner.phase === 'listening' ? 'PARAR AFINADOR' : tuner.phase === 'requesting-permission' ? 'PREPARANDO MICROFONE' : 'INICIAR AFINADOR'}</Button>
          <p className={`tuner-status ${tuner.phase === 'error' ? 'is-error' : ''}`} role="status">{tuner.message}</p>
        </section>
      ) : null}

      {tab === 'transpose' ? (
        <section id="tool-panel-transpose" className="music-tool-panel" role="tabpanel" aria-labelledby="tool-tab-transpose">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="transpose" size={21} /></span><div><p>CIFRAS</p><h2>Transpor sem travar</h2></div></div>
          <label className="field-label" htmlFor="progression">PROGRESSÃO ORIGINAL</label>
          <input id="progression" className="music-input" value={progression} onChange={(event) => setProgression(event.target.value)} placeholder="Ex.: G D Em C" />
          <div className="transpose-controls"><button type="button" onClick={() => setTransposeSteps((value) => value - 1)}>−</button><div><span>DESLOCAMENTO</span><strong>{transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps} semitom{Math.abs(transposeSteps) === 1 ? '' : 's'}</strong></div><button type="button" onClick={() => setTransposeSteps((value) => value + 1)}>+</button></div>
          <div className="progression-result"><span>RESULTADO</span><strong>{transposedProgression || 'Digite as cifras acima'}</strong></div>
          <p className="tool-note">Preserva acordes menores, extensões e baixos como <code>G/B</code>.</p>
        </section>
      ) : null}

      {tab === 'capo' ? (
        <section id="tool-panel-capo" className="music-tool-panel" role="tabpanel" aria-labelledby="tool-tab-capo">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="transpose" size={21} /></span><div><p>VIOLÃO</p><h2>Capo sem tentativa</h2></div></div>
          <div className="two-fields"><label className="field-label" htmlFor="capo-key">TOM DESEJADO<select id="capo-key" value={capoKey} onChange={(event) => setCapoKey(event.target.value)}>{NOTES.map((note) => <option key={note}>{note}</option>)}</select></label><label className="field-label" htmlFor="capo-fret">CASA DO CAPO<select id="capo-fret" value={capo} onChange={(event) => setCapo(Number(event.target.value))}>{Array.from({ length: 8 }, (_, value) => <option key={value} value={value}>{value === 0 ? 'Sem capo' : `${value}ª casa`}</option>)}</select></label></div>
          <div className="capo-result"><span>FORMA PARA TOCAR</span><strong>{capoShape ?? '—'}</strong><p>{capo === 0 ? 'Você pode tocar diretamente no tom desejado.' : `Com o capo na ${capo}ª casa, use a forma de ${capoShape}.`}</p></div>
          <p className="tool-note">O cálculo mostra a forma-base; as cifras podem ser transpostas na aba anterior.</p>
        </section>
      ) : null}

      {tab === 'repertoire' ? (
        <section id="tool-panel-repertoire" className="music-tool-panel" role="tabpanel" aria-labelledby="tool-tab-repertoire">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="clock" size={21} /></span><div><p>REPERTÓRIO</p><h2>Próxima música</h2></div></div>
          <form className="repertoire-form" onSubmit={addSong}><label className="field-label" htmlFor="song-title">NOME DA MÚSICA<input id="song-title" className="music-input" value={songTitle} onChange={(event) => setSongTitle(event.target.value)} placeholder="Ex.: Teu Amor Não Falha" /></label><Button variant="secondary" icon="arrow" type="submit">SALVAR NO REPERTÓRIO</Button></form>
          {repertoire.length ? <ul className="repertoire-list">{repertoire.map((song) => <li key={song.id}><div><strong>{song.title}</strong><span>{song.key} · {song.capo ? `capo ${song.capo}` : 'sem capo'} · {song.progression}</span></div><button type="button" aria-label={`Remover ${song.title}`} onClick={() => removeSong(song.id)}>×</button></li>)}</ul> : <p className="empty-repertoire">Seu repertório fica guardado neste dispositivo. Salve a primeira música quando estiver pronto.</p>}
        </section>
      ) : null}

      {tab === 'worship' ? (
        <section id="tool-panel-worship" className="music-tool-panel worship-panel" role="tabpanel" aria-labelledby="tool-tab-worship">
          <div className="music-tool-panel__heading"><span className="tool-mark"><Icon name="spark" size={21} /></span><div><p>MODO IGREJA</p><h2>Próxima música</h2></div></div>
          <p className="worship-panel__intro">Escolha uma música salva. O modo de apresentação deixa tom, capo e cifras visíveis para o palco, mesmo sem internet.</p>
          {repertoire.length ? (
            <>
              <label className="field-label" htmlFor="worship-song">MÚSICA ATUAL<select id="worship-song" value={worshipSong?.id ?? ''} onChange={(event) => setWorshipSongId(event.target.value)}>{repertoire.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select></label>
              {worshipSong ? <div className="worship-song-card"><span>PRÓXIMA NO CULTO</span><strong>{worshipSong.title}</strong><div><b>{worshipSong.key}</b><p>{worshipSong.capo ? `Capo ${worshipSong.capo}` : 'Sem capo'}<br />{worshipSong.progression || 'Sem cifras registradas'}</p></div></div> : null}
              <Button variant="primary" icon="arrow" onClick={() => setIsWorshipPresentation(true)}>ABRIR MODO APRESENTAÇÃO</Button>
            </>
          ) : (
            <div className="worship-empty"><p>Ainda não há músicas no repertório deste dispositivo.</p><Button variant="secondary" icon="arrow" onClick={() => setTab('repertoire')}>ADICIONAR MÚSICA</Button></div>
          )}
        </section>
      ) : null}

      <p className="tools-page__next"><Icon name="shield" size={15} /> Dados, repertório e preferências ficam neste dispositivo. A calibração de áudio em aparelhos reais segue como etapa de QA.</p>

      {isWorshipPresentation && worshipSong ? (
        <section className="worship-presentation" aria-label="Modo de apresentação">
          <div className="worship-presentation__bar"><span>MODO CULTO · OFFLINE</span><button type="button" onClick={() => setIsWorshipPresentation(false)}>FECHAR</button></div>
          <div className="worship-presentation__content"><p>PRÓXIMA MÚSICA</p><h2>{worshipSong.title}</h2><div className="worship-presentation__key"><span>TOM</span><strong>{worshipSong.key}</strong><small>{worshipSong.capo ? `CAPO ${worshipSong.capo}` : 'SEM CAPO'}</small></div><pre>{worshipSong.progression || 'Sem cifras registradas'}</pre></div>
        </section>
      ) : null}
    </section>
  );
}
