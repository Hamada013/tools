import { Y as React } from './vendor.js';

export function useRecording(lang) {
  const [recording, setRecording] = React.useState(false);
  const [recordingPending, setPending] = React.useState(false);
  const [recordingUrl, setUrl] = React.useState(null);
  const [recordingError, setError] = React.useState('');
  const session = React.useRef({ generation: 0, recorder: null, stream: null, url: null, player: null });
  const messages = lang === 'ar' ? {
    unsupported: 'التسجيل غير متاح في هذا المتصفح. جرّب متصفحاً حديثاً عبر اتصال HTTPS.',
    denied: 'لم يُسمح بالوصول إلى الميكروفون. اسمح بالوصول من إعدادات الموقع ثم حاول مجدداً.',
    missing: 'لم يتم العثور على ميكروفون. تحقق من توصيله ثم حاول مجدداً.',
    failed: 'تعذر بدء التسجيل. تحقق من الميكروفون وحاول مجدداً.',
    playback: 'تعذر تشغيل التسجيل. حاول تشغيله مجدداً.',
    empty: 'لم يُلتقط صوت. حاول التسجيل مرة أخرى.'
  } : {
    unsupported: 'Recording is unavailable in this browser. Try a current browser over HTTPS.',
    denied: 'Microphone access was denied. Allow access in the site settings and try again.',
    missing: 'No microphone was found. Connect one and try again.',
    failed: 'Recording could not start. Check your microphone and try again.',
    playback: 'The recording could not play. Try playing it again.',
    empty: 'No audio was captured. Try recording again.'
  };
  function releaseAudio() {
    const s = session.current;
    s.player?.pause();
    s.player = null;
    if (s.url) URL.revokeObjectURL(s.url);
    s.url = null;
    setUrl(null);
  }
  function stopRecording() {
    const s = session.current;
    s.player?.pause();
    document.querySelector('.ff-status audio')?.pause();
    ++s.generation; // Also cancel a microphone permission request still in flight.
    if (s.recorder && s.recorder.state !== 'inactive') s.recorder.stop();
    s.stream?.getTracks().forEach(track => track.stop());
    s.stream = null;
    setRecording(false);
    setPending(false);
  }
  function discardRecording() {
    const s = session.current;
    if (s.recorder) s.recorder.onstop = null;
    stopRecording();
    releaseAudio();
    setError('');
  }
  async function startRecording() {
    const s = session.current;
    if (s.stream || recordingPending) return;
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError(messages.unsupported);
      return;
    }
    const generation = ++s.generation;
    setPending(true);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== s.generation || document.hidden) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
        .find(type => MediaRecorder.isTypeSupported?.(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      s.stream = stream;
      s.recorder = recorder;
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        if (s.recorder !== recorder) return;
        s.recorder = null;
        s.stream = null;
        setRecording(false);
        if (!chunks.length) { setError(messages.empty); return; }
        releaseAudio();
        s.url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || chunks[0].type }));
        setUrl(s.url);
      };
      recorder.onerror = () => { setError(messages.failed); stopRecording(); };
      recorder.start();
      releaseAudio();
      setRecording(true);
    } catch (error) {
      stream?.getTracks().forEach(track => track.stop());
      if (s.stream === stream) { s.stream = null; s.recorder = null; }
      if (generation === s.generation) setError(error.name === 'NotAllowedError' ? messages.denied : error.name === 'NotFoundError' ? messages.missing : messages.failed);
    } finally {
      if (generation === s.generation) setPending(false);
    }
  }
  function playRecording() {
    const s = session.current;
    if (!s.url) return;
    s.player?.pause();
    s.player = document.querySelector('.ff-status audio') || new Audio(s.url);
    setError('');
    s.player.play().catch(() => setError(messages.playback));
  }
  React.useEffect(() => () => {
    const s = session.current;
    ++s.generation;
    if (s.recorder) {
      s.recorder.onstop = null;
      if (s.recorder.state !== 'inactive') s.recorder.stop();
    }
    s.stream?.getTracks().forEach(track => track.stop());
    s.player?.pause();
    if (s.url) URL.revokeObjectURL(s.url);
  }, []);
  return { recording, recordingPending, recordingUrl, recordingError, startRecording, stopRecording, playRecording, clearRecording: discardRecording, discardRecording };
}
