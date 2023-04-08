<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
  
    export let labels: string[] = [];
    export let values: any[] = [];
    export let title: string = '';
    export let cost: number = 0;
    
    let infoEl: HTMLDivElement;
    let chartEl: HTMLCanvasElement;
    let chart;
    
    $: {values; updateChart()};
    
    //update chart with new data
    function updateChart() {
      if (infoEl && (cost || values.reduce((a, b) => a + b, 0))){
        infoEl.classList.remove('hidden')
      }
      if (chart){
        chart.update();
      }
    }

    const colors = [
      'rgb(255,99,132)',
      'rgb(54,162,235)',
      'rgb(255,205,86)',
      'rgb(75,192,192)',
      'rgb(153,102,255)',
      'rgb(255,159,64)',
      'rgb(255,99,132,0.2)',
      'rgb(54,162,235,0.2)',
      'rgb(255,205,86,0.2)',
      'rgb(75,192,192,0.2)',
      'rgb(153,102,255,0.2)',
      'rgb(255,159,64,0.2)'
    ]
  
  
    onMount(() => {
      const ctx: CanvasRenderingContext2D = chartEl.getContext('2d');
      
      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: colors
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title
            }
          }
        }
      });
    });
  
    
  </script>
  
  <div bind:this={infoEl} class="h-[300px] w-[300px] top-0 hidden">
    <canvas id="chart" bind:this={chartEl}></canvas>

    <grid class="grid grid-cols-2 mx-auto">
        {#each labels as label, i}
            <h4 class="text-right mx-2" style="color: {colors[i]}">{label}:</h4>
            <h4 class="">{values[i]}g</h4>
        {/each}
        <h4 class="text-right mx-2" style="color: {colors[labels.length]}">cost:</h4>
        <h4 class="">£{cost}</h4>
    </grid>

  </div>
  
  <style>    
  </style>  
 