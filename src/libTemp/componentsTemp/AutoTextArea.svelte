<script lang="ts">
	export let value:string = '';
	export let minRows:number = 1;
	export let maxRows: number;
    export let placeholder: string = '';
    export let minCols: number = 8;
    export let maxCols:number = 15;
    export let title: string = '';
	
	$: minHeight = `${1 + minRows * 1.2}em`;
	// $: maxHeight = maxRows ? `${1 + maxRows * 2.2}em` : `auto`
    const maxHeight = '5rem'
    // const minHeight = '5rem'
    $: minWidth = minCols ? `${1 + minCols * 1.2}em` : 80;
    $: maxWidth = maxCols ? `${1 + maxCols * 1.2}em` : `auto`;
</script>

<div class="container relative">
	<pre 
		aria-hidden="true"
		style="min-height: {minHeight}; max-height: {maxHeight}; min-width: {minWidth}; max-width: {maxWidth};"
        class="overflow-hidden"
	>{value + '\n'}</pre>

	<textarea bind:value placeholder="{placeholder}" class="absolute w-full h-full top-0 resize-none rounded outline-none drop-shadow-sm focus:drop-shadow-lg overflow-hidden text-center" title="{title}"></textarea>	
</div>

<style>
	.container {
		position: relative;
	}
	
	pre, textarea {
		font-family: inherit;
		padding: 0.5em;
		box-sizing: border-box;
		line-height: 1.2;
		overflow: hidden;
	}
	
	textarea {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		resize: none;
	}
</style>