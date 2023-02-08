<script>
    import DayTracker from '../Lib/Components/DayTracker.svelte';

    const now = new Date();

</script>

<div class="flex justify-center items-center">
    <DayTracker date ={now}/>
</div>

