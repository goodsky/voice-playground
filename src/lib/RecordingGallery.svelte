<script lang="ts">
  import type { Recording } from './audioService';

  interface Props {
    recordings: Recording[];
    selectedId: string | null;
    onSelect: (recording: Recording) => void;
    onDelete: (recording: Recording) => void;
  }

  let { recordings, selectedId, onSelect, onDelete }: Props = $props();

  function handleDelete(event: MouseEvent, recording: Recording) {
    event.stopPropagation();
    onDelete(recording);
  }
</script>

{#if recordings.length > 0}
  <div class="gallery-container">
    <div class="gallery">
      {#each recordings as recording (recording.id)}
        <div class="recording-wrapper">
          <button
            class="recording-item"
            class:selected={selectedId === recording.id}
            style="--recording-color: {recording.color}"
            onclick={() => onSelect(recording)}
            aria-label="Select recording"
          >
            <div class="recording-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </button>
          {#if selectedId === recording.id}
            <button
              class="delete-button"
              onclick={(e) => handleDelete(e, recording)}
              aria-label="Delete recording"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .gallery-container {
    width: 100%;
    overflow-x: auto;
    padding: 10px 0;
    -webkit-overflow-scrolling: touch;
  }

  .gallery {
    display: flex;
    gap: 12px;
    padding: 0 4px;
    min-width: min-content;
  }

  .recording-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .recording-item {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 3px solid transparent;
    background: var(--recording-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    -webkit-tap-highlight-color: transparent;
  }

  .recording-item:active {
    transform: scale(0.95);
  }

  .recording-item.selected {
    border-color: white;
    transform: scale(1.1);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
  }

  .recording-icon {
    width: 28px;
    height: 28px;
    color: white;
    opacity: 0.9;
  }

  .recording-icon svg {
    width: 100%;
    height: 100%;
  }

  .delete-button {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: #ff4757;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    -webkit-tap-highlight-color: transparent;
    animation: pop-in 0.2s ease;
  }

  .delete-button:active {
    transform: scale(0.9);
  }

  .delete-button svg {
    width: 16px;
    height: 16px;
  }

  @keyframes pop-in {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
