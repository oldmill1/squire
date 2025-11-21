<script lang="ts">
  import { onMount } from 'svelte';
  import styles from './BackgroundShapes.module.scss';
  
  // Background shape animations using reactive state
  let shape1Transform = $state('translate(0px, 0px) rotate(0deg) scale(1)');
  let shape2Transform = $state('translate(0px, 0px) rotate(0deg) scale(1)');
  let shape3Transform = $state('translate(0px, 0px) rotate(0deg) scale(1)');
  let shape4Transform = $state('translate(0px, 0px) rotate(0deg) scale(1)');
  
  onMount(() => {
    // Animate background shapes
    let time = 0;
    const animateShapes = () => {
      time += 0.01;
      
      // Shape 1: Gentle floating
      const shape1X = Math.sin(time * 0.3) * 30;
      const shape1Y = Math.cos(time * 0.2) * 20;
      const shape1Rotate = time * 20;
      const shape1Scale = 1 + Math.sin(time * 0.4) * 0.1;
      shape1Transform = `translate(${shape1X}px, ${shape1Y}px) rotate(${shape1Rotate}deg) scale(${shape1Scale})`;
      
      // Shape 2: Dynamic movement
      const shape2X = Math.cos(time * 0.5) * 25;
      const shape2Y = Math.sin(time * 0.3) * 15;
      const shape2Rotate = -time * 30;
      const shape2Scale = 1 + Math.sin(time * 0.6) * 0.2;
      shape2Transform = `translate(${shape2X}px, ${shape2Y}px) rotate(${shape2Rotate}deg) scale(${shape2Scale})`;
      
      // Shape 3: Complex pattern
      const shape3X = Math.sin(time * 0.4) * 20 + Math.cos(time * 0.7) * 10;
      const shape3Y = Math.cos(time * 0.5) * 30 + Math.sin(time * 0.3) * 10;
      const shape3Rotate = time * 15;
      const shape3Scale = 1 + Math.sin(time * 0.8) * 0.15;
      shape3Transform = `translate(${shape3X}px, ${shape3Y}px) rotate(${shape3Rotate}deg) scale(${shape3Scale})`;
      
      // Shape 4: Quick movement
      const shape4X = Math.sin(time * 0.8) * 15;
      const shape4Y = Math.cos(time * 0.9) * 20;
      const shape4Rotate = -time * 40;
      const shape4Scale = 1 + Math.sin(time * 1.0) * 0.25;
      shape4Transform = `translate(${shape4X}px, ${shape4Y}px) rotate(${shape4Rotate}deg) scale(${shape4Scale})`;
      
      requestAnimationFrame(animateShapes);
    };
    
    animateShapes();
  });
</script>

<div class={styles.backgroundShapes}>
  <div class="{styles.shape} {styles.shape1}" style="transform: {shape1Transform}"></div>
  <div class="{styles.shape} {styles.shape2}" style="transform: {shape2Transform}"></div>
  <div class="{styles.shape} {styles.shape3}" style="transform: {shape3Transform}"></div>
  <div class="{styles.shape} {styles.shape4}" style="transform: {shape4Transform}"></div>
</div>
