<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import { currentUser, pb } from '../../lib/pb/pocketbase';

    interface WeightData {
        date: string;
        weight: number;
    }

    let chartEl: HTMLCanvasElement;
    let noData: boolean = false;

    async function getWeightData(){
        
        let weightResp
        try {

            weightResp = await pb.collection('day_track').getList(1, 50, {
                filter: 'user.id = "' + $currentUser?.id + '" && weight > 0',
                sort: 'date',
            })
        } catch (e) {
            console.log(e);
            return [];
        }

        if (weightResp.items.length > 0) {

            let data: any[] = [];
            weightResp.items.map((item: any) => {
                data.push({
                    date: item.date,
                    weight: item.weight
                })
            })
            return data;
        } else {
            return [];
        }
    }

    function drawChart(data: WeightData[]){
        new Chart(
            chartEl, {
                type: 'line',
                data: {
                    labels: data.map((item: any) => (new Date(item.date)).toLocaleDateString("en-UK", {day: 'numeric', month: 'short' } )),
                    datasets: [{
                        label: 'Weight in kg',
                        data: data.map((item: any) => item.weight),                    
                    }]
                },
            }
        )
    }

    onMount(async () => {
        const data = await getWeightData()
        if (data.length == 0) {
            noData = true;
        }
        drawChart(data);
    })


</script>

<div>
    <canvas bind:this={chartEl}>
    </canvas>
    {#if noData}
        <p class="text-center">Looks like you don't have any data yet. you can being recording your weight on the <a href='/track' class="underline">Track</a> page</p>
    {/if}
</div>



<style>
    canvas {
        width: 100%;
        max-width: 800px;
        margin: auto;
    }
</style>
