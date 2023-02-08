<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import { currentUser, pb } from '../../Lib/pb/pocketbase';

    interface WeightData {
        date: string;
        weight: number;
    }

    let chartEl: HTMLCanvasElement;

    async function getWeightData(){
        const weightResp = await pb.collection('day_track').getList(1, 50, {
            filter: 'user.id = "' + $currentUser?.id + '" && weight > 0',
            sort: 'date',
        }).then()
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
        const data = await getWeightData();
        console.log(data);
        drawChart(data);
    })


</script>

<div style="width: 800px">
    <canvas bind:this={chartEl}>
        
    </canvas>
</div>


