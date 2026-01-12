<script lang="ts">
  import { onMount } from 'svelte';
  import { audioService, type Effect, type Recording } from './lib/audioService';
  import RecordButton from './lib/RecordButton.svelte';
  import Waveform from './lib/Waveform.svelte';
  import EffectPicker from './lib/EffectPicker.svelte';
  import PlaybackControls from './lib/PlaybackControls.svelte';
  import RecordingGallery from './lib/RecordingGallery.svelte';

  const MAX_RECORDINGS = 8;
  const RECORDING_DURATION = 60000;

  let isRecording = $state(false);
  let isPlaying = $state(false);
  let remainingSeconds = $state(60);
  let selectedEffect: Effect = $state('none');
  let recordings: Recording[] = $state([]);
  let selectedRecording: Recording | null = $state(null);
  let analyser: AnalyserNode | null = $state(null);
  let permissionDenied = $state(false);
  let recordingInterval: ReturnType<typeof setInterval> | null = null;

  async function handleStartRecording() {
    remainingSeconds = Math.floor(RECORDING_DURATION / 1000);

    const started = await audioService.startRecording((recording) => {
      // Recording complete callback
      recordings = [...recordings, recording].slice(-MAX_RECORDINGS);
      selectedRecording = recording;
      isRecording = false;
      if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
      }
    }, RECORDING_DURATION);

    if (started) {
      isRecording = true;
      analyser = audioService.createRecordingAnalyser();

      // Update countdown
      recordingInterval = setInterval(() => {
        remainingSeconds = Math.max(0, remainingSeconds - 1);
      }, 1000);
    } else {
      permissionDenied = true;
    }
  }

  function handleStopRecording() {
    audioService.stopRecording();
    isRecording = false;
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }
  }

  async function handlePlay() {
    if (!selectedRecording) return;

    isPlaying = true;
    await audioService.playWithEffect(selectedRecording, selectedEffect);
    analyser = audioService.getAnalyser();

    // Check periodically if playback is done
    const checkInterval = setInterval(() => {
      if (!audioService.isCurrentlyPlaying()) {
        isPlaying = false;
        clearInterval(checkInterval);
      }
    }, 100);
  }

  function handleStop() {
    audioService.stopPlayback();
    isPlaying = false;
  }

  function handleSelectRecording(recording: Recording) {
    selectedRecording = recording;
    // Stop playback if switching recordings
    if (isPlaying) {
      handleStop();
    }
  }

  function handleDeleteRecording(recording: Recording) {
    // Stop playback if deleting the currently playing recording
    if (isPlaying && selectedRecording?.id === recording.id) {
      handleStop();
    }

    recordings = recordings.filter(r => r.id !== recording.id);

    // If we deleted the selected recording, select another or clear
    if (selectedRecording?.id === recording.id) {
      selectedRecording = recordings.length > 0 ? recordings[recordings.length - 1] : null;
    }
  }

  function handleSelectEffect(effect: Effect) {
    selectedEffect = effect;
    // If currently playing, restart with new effect
    if (isPlaying && selectedRecording) {
      handlePlay();
    }
  }

  onMount(async () => {
    // Pre-request permission to show prompt early
    const hasPermission = await audioService.requestMicPermission();
    if (!hasPermission) {
      permissionDenied = true;
    }
  });
</script>

<main>
  {#if permissionDenied}
    <div class="permission-denied">
      <div class="sad-mic">🎤</div>
      <div class="sad-face">😢</div>
    </div>
  {:else}
    <div class="app-content">
      <Waveform {analyser} isActive={isRecording || isPlaying} />

      <div class="controls-section">
        <RecordButton
          {isRecording}
          {remainingSeconds}
          disabled={isPlaying}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
        />

        <PlaybackControls
          {isPlaying}
          hasRecording={selectedRecording !== null}
          onPlay={handlePlay}
          onStop={handleStop}
        />
      </div>

      <EffectPicker
        {selectedEffect}
        disabled={isRecording}
        onSelect={handleSelectEffect}
      />

      <RecordingGallery
        {recordings}
        selectedId={selectedRecording?.id ?? null}
        onSelect={handleSelectRecording}
        onDelete={handleDeleteRecording}
      />
    </div>
  {/if}
</main>

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    overflow-x: hidden;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    padding-top: env(safe-area-inset-top, 20px);
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }

  .permission-denied {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .sad-mic {
    font-size: 80px;
    opacity: 0.5;
    filter: grayscale(1);
  }

  .sad-face {
    font-size: 60px;
  }

  .app-content {
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .controls-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }
</style>
