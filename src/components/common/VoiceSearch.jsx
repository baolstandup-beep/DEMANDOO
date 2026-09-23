import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';

const WEBHOOK_URL = 'https://baolvision.app.n8n.cloud/webhook/demandoo-voice';
const MAX_RECORDING_MS = 30000;

export const VoiceSearch = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioUrlRef = useRef('');

  useEffect(() => () => {
    clearTimeout(timeoutRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  const stopRecording = () => {
    clearTimeout(timeoutRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const startRecording = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('L’enregistrement audio n’est pas disponible sur ce navigateur.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm']
        .find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = event => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        setStatus('idle');
        setError('L’enregistrement a échoué. Réessayez.');
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        const type = recorder.mimeType || 'audio/webm';
        const extension = type.includes('mp4') ? 'm4a' : 'webm';
        const file = new File(chunks, `demandoo-voice.${extension}`, { type });
        if (!file.size) {
          setStatus('idle');
          setError('Aucun son enregistré. Réessayez.');
          return;
        }

        setStatus('sending');
        try {
          const body = new FormData();
          body.append('audio', file);
          const response = await fetch(WEBHOOK_URL, { method: 'POST', body });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const contentType = response.headers.get('content-type') || '';
          if (!contentType.startsWith('audio/')) throw new Error('Réponse audio absente');
          const blob = await response.blob();
          if (!blob.size) throw new Error('Réponse audio vide');
          if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = URL.createObjectURL(blob);
          setAudioUrl(audioUrlRef.current);
          setStatus('ready');
        } catch (cause) {
          setStatus('idle');
          setError('L’assistant vocal ne répond pas pour le moment. Réessayez plus tard.');
          console.error('Demandoo voice webhook:', cause);
        }
      };

      recorder.start();
      setStatus('recording');
      timeoutRef.current = setTimeout(stopRecording, MAX_RECORDING_MS);
    } catch (cause) {
      setStatus('idle');
      setError(cause?.name === 'NotAllowedError'
        ? 'Autorisez le microphone pour utiliser la recherche vocale.'
        : 'Impossible d’accéder au microphone.');
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white/95 p-4 text-left shadow-lg" aria-live="polite">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={status === 'recording' ? stopRecording : startRecording}
          disabled={status === 'sending'}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-demandoo-500 px-4 py-3 font-bold text-white hover:bg-demandoo-400 disabled:cursor-wait disabled:opacity-60"
          aria-label={status === 'recording' ? 'Arrêter l’enregistrement' : 'Lancer la recherche vocale'}
        >
          {status === 'recording' ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {status === 'recording' ? 'Terminer' : 'Rechercher par la voix'}
        </button>
        <span className="text-sm text-slate-600">
          {status === 'recording' ? 'Parlez maintenant (30 secondes maximum).' :
            status === 'sending' ? 'Recherche en cours…' :
              'Dites votre départ, destination, date et nombre de passagers.'}
        </span>
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-rose-700">{error}</p>}
      {audioUrl && status === 'ready' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Volume2 className="h-5 w-5 text-demandoo-600" aria-hidden="true" />
          <span className="text-sm font-semibold text-slate-700">Réponse de Demandoo</span>
          <audio controls src={audioUrl} className="max-w-full" aria-label="Réponse vocale de Demandoo" />
        </div>
      )}
    </div>
  );
};
