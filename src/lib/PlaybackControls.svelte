<script lang="ts">
  interface Props {
    isPlaying: boolean;
    hasRecording: boolean;
    onPlay: () => void;
    onStop: () => void;
  }

  let { isPlaying, hasRecording, onPlay, onStop }: Props = $props();

  function handleClick() {
    if (!hasRecording) return;
    if (isPlaying) {
      onStop();
    } else {
      onPlay();
    }
  }
</script>

<button
  class="play-button"
  class:playing={isPlaying}
  class:disabled={!hasRecording}
  onclick={handleClick}
  aria-label={isPlaying ? 'Stop' : 'Play'}
>
  <div class="icon">
    {#if isPlaying}
      <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
    {/if}
  </div>
</button>

<style>
  .play-button {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(145deg, #6BCB77, #5cb868);
    box-shadow:
      0 6px 16px rgba(107, 203, 119, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .play-button:active:not(.disabled) {
    transform: scale(0.95);
  }

  .play-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: linear-gradient(145deg, #999, #888);
    box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.2),
      inset 0 2px 4px rgba(255, 255, 255, 0.1);
  }

  .play-button.playing {
    background: linear-gradient(145deg, #f39c12, #e67e22);
    box-shadow:
      0 6px 16px rgba(243, 156, 18, 0.4),
      inset 0 2px 4px rgba(255, 255, 255, 0.2);
  }

  .icon {
    width: 36px;
    height: 36px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon svg {
    width: 100%;
    height: 100%;
  }

  /* Shift play icon slightly right for visual centering */
  .play-button:not(.playing) .icon {
    margin-left: 4px;
  }
</style>
