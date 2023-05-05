<script lang="ts">
	import LoadingRings from "./LoadingRings.svelte";
    export let show: boolean = false;

</script>


{#if show}
    <overlay class="w-full h-full fixed "> 
        <LoadingRings />
    </overlay>
{/if}