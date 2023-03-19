<script>
    // import DayTracker from '../lib/components/tracker/DayTracker.svelte';
    import DayTracker from '../lib/components/tracker/DayTracker.svelte';

    const now = new Date();

</script>

<div class="flex justify-center">
    <DayTracker date ={now}/>
</div>

