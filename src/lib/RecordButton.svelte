<script lang="ts">
  interface Props {
    isRecording: boolean;
    remainingSeconds: number;
    disabled?: boolean;
    onStart: () => void;
    onStop: () => void;
  }

  let { isRecording, remainingSeconds, disabled = false, onStart, onStop }: Props = $props();

  function handleClick() {
    if (disabled) return;
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  }
</script>

<button
  class="record-button"
  class:recording={isRecording}
  class:disabled={disabled}
  onclick={handleClick}
  aria-label={isRecording ? 'Stop recording' : 'Start recording'}
>
  <div class="icon">
    {#if isRecording}
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
    {/if}
  </div>
  {#if isRecording}
    <div class="timer">{remainingSeconds}</div>
  {/if}
</button>

<style>
  .record-button {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(145deg, #ff6b6b, #ee5a5a);
    box-shadow:
      0 8px 20px rgba(238, 90, 90, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }

  .record-button:active:not(.disabled) {
    transform: scale(0.95);
    box-shadow:
      0 4px 10px rgba(238, 90, 90, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
  }

  .record-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .record-button.recording {
    background: linear-gradient(145deg, #4ECDC4, #45b7aa);
    box-shadow:
      0 8px 20px rgba(78, 205, 196, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow:
        0 8px 20px rgba(78, 205, 196, 0.4),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }
    50% {
      transform: scale(1.05);
      box-shadow:
        0 12px 30px rgba(78, 205, 196, 0.6),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }
  }

  .icon {
    width: 48px;
    height: 48px;
    color: white;
  }

  .icon svg {
    width: 100%;
    height: 100%;
  }

  .timer {
    position: absolute;
    bottom: 12px;
    font-size: 18px;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
</style>
