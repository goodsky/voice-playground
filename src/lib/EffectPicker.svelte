<script lang="ts">
  import type { Effect } from './audioService';

  interface Props {
    selectedEffect: Effect;
    disabled?: boolean;
    onSelect: (effect: Effect) => void;
  }

  let { selectedEffect, disabled = false, onSelect }: Props = $props();

  const effects: { id: Effect; emoji: string; label: string; color: string }[] = [
    { id: 'none', emoji: '🎤', label: 'Normal', color: '#95a5a6' },
    { id: 'chipmunk', emoji: '🐿️', label: 'Chipmunk', color: '#f39c12' },
    { id: 'monster', emoji: '👹', label: 'Monster', color: '#9b59b6' },
    { id: 'echo', emoji: '🔊', label: 'Echo', color: '#3498db' }
  ];

  function handleSelect(effect: Effect) {
    if (!disabled) {
      onSelect(effect);
    }
  }
</script>

<div class="effect-picker" class:disabled={disabled}>
  {#each effects as effect}
    <button
      class="effect-button"
      class:selected={selectedEffect === effect.id}
      style="--effect-color: {effect.color}"
      onclick={() => handleSelect(effect.id)}
      aria-label={effect.label}
    >
      <span class="emoji">{effect.emoji}</span>
    </button>
  {/each}
</div>

<style>
  .effect-picker {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .effect-picker.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  .effect-button {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    border: 4px solid transparent;
    background: rgba(255, 255, 255, 0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .effect-button:active {
    transform: scale(0.95);
  }

  .effect-button.selected {
    border-color: var(--effect-color);
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .emoji {
    font-size: 36px;
    line-height: 1;
  }
</style>
