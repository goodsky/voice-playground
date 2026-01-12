<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    analyser: AnalyserNode | null;
    isActive: boolean;
  }

  let { analyser, isActive }: Props = $props();

  let canvas: HTMLCanvasElement;
  let animationId: number | null = null;

  const BAR_COLORS = [
    '#FF6B6B', '#FF8E72', '#FFB347', '#FFD93D',
    '#6BCB77', '#4ECDC4', '#45B7D1', '#7B68EE',
    '#DDA0DD', '#FF69B4'
  ];

  function draw() {
    if (!canvas || !analyser || !isActive) {
      animationId = requestAnimationFrame(draw);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    const barCount = 20;
    const barWidth = (canvas.width / barCount) - 4;
    const gap = 4;

    for (let i = 0; i < barCount; i++) {
      // Sample from frequency data
      const dataIndex = Math.floor((i / barCount) * bufferLength);
      const value = dataArray[dataIndex];
      const barHeight = (value / 255) * (canvas.height - 20);

      const x = i * (barWidth + gap) + gap / 2;
      const y = canvas.height - barHeight - 10;

      // Create rounded rectangle
      const radius = barWidth / 2;
      ctx.fillStyle = BAR_COLORS[i % BAR_COLORS.length];
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight + 10, radius);
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }

  onMount(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationId = requestAnimationFrame(draw);
  });

  onDestroy(() => {
    window.removeEventListener('resize', resizeCanvas);
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
</script>

<div class="waveform-container">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .waveform-container {
    width: 100%;
    height: 120px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    padding: 10px;
    box-sizing: border-box;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
