<script>
    // import DayTracker from '../lib/components/tracker/DayTracker.svelte';
    import DayTracker from '../lib/components/tracker/DayTracker.svelte';

    const now = new Date();

</script>

<div class="flex justify-center items-center flex-col lg:flex-row mx-auto">
    <DayTracker date ={now}/>
</div>

