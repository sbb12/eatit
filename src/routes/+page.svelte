<script>
    import DayTracker from '../Lib/Components/tracker/DayTracker.svelte';

    const now = new Date();

</script>

<div class="flex justify-center items-center">
    <DayTracker date ={now}/>
</div>

