<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { OptionType } from "../../types/types";
    const dispatch = createEventDispatcher();

    export let option: OptionType;
    export let i: number;
    
    let tooltipEl: HTMLElement;
    let tooltipText: string = '';

    let calcOpen: boolean = false;
    let calcInput: number|null;
    const precision = 3;

    // display tooltip on focused input
    function showTooltip(e: FocusEvent){
        calcOpen = false;
        const target = e.target as HTMLElement | null;
        if ( ! target) return;
        
        tooltipEl.style.top = `${target.offsetTop - 35}px`;
        tooltipEl.style.left = `${target.offsetLeft}px`;

        tooltipText = target.title;
        tooltipEl.classList.remove('hidden');

    }

    function hideTooltip(){
        tooltipEl.classList.add('hidden');
    }

    
    function optionMultiply(){
        if (option.calories) option.calories = Number((option.calories * calcInput).toPrecision(precision));
        if (option.cost) option.cost = Number((option.cost * calcInput).toPrecision(precision)) ?? 0;
        if (option.protein) option.protein = Number((option.protein * calcInput).toPrecision(precision));
        if (option.fat) option.fat = Number((option.fat * calcInput).toPrecision(precision));
        if (option.carbs) option.carbs = Number((option.carbs * calcInput).toPrecision(precision));   
        
        calcOpen = false
        calcInput = null
    }
        
    function optionDivide(){

        // lets not divide by zero
        if (calcInput == 0) return;

        if (option.calories) option.calories = Number((option.calories / calcInput).toFixed(precision));
        if (option.cost) option.cost = Number((option.cost / calcInput).toFixed(precision));
        if (option.protein) option.protein = Number((option.protein / calcInput).toFixed(precision));
        if (option.fat) option.fat = Number((option.fat / calcInput).toFixed(precision));
        if (option.carbs) option.carbs = Number((option.carbs / calcInput).toFixed(precision));
        
        calcOpen = false
        calcInput = null
    }

    function inlineCalc(e: Event){
        const target = e.target as HTMLInputElement;
        let value = target.value;
        if (value.startsWith('=')){
            // replace multiply sign with *
            value = value.replaceAll('x|×', '*');
            value = value.replaceAll('÷', '/');
            try {
                const expression = value.substring(1)
                option.cost = parseFloat(eval(expression).toFixed(precision));
            } catch (error) {
                console.log(error)
            }
        } 
    }
    

    // duplicate
    function duplicate(){
        const newOption = {
            measure: '',
            calories: option.calories,
            cost: option.cost,
            protein: option.protein,
            fat: option.fat,
            carbs: option.carbs,
            desc: ''
        }
        dispatch('duplicate', newOption);
    }

    function handleCalcPress(){
        calcOpen = true;
        setTimeout(() => {
            const inputEl = document.getElementById(`calc-${i}`) as HTMLInputElement;
            console.log(inputEl, i)
            inputEl.focus();
        }, 34);
    }

    function handleDragEnter(event: DragEvent){
        // set cursor grabbing
    }

    function handleDragEnd(event: DragEvent){
        // const target = event.target as HTMLElement;
        const dropY = event.clientY;

        const data = {
            i: i,
            dropY: dropY,
            height: event.target.getBoundingClientRect().height
        }
        dispatch('reOrderOption', data);
    }

    function dragTop(){
        dispatch('dragTop', i);
    }

    function remove(){
        dispatch('remove', i);
    }

</script>


<!-- calculator -->



<div class="grid grid-cols-6 mt-1 mb-3 gap-2 text-center border rounded-sm relative p-2 option" id="option-{i}" >

    {#if calcOpen}
        <div class=" h-8 flex items-center align-middle justify-center space-x-3 col-span-full">
            <input type="number" inputmode="numeric" id='calc-{i}' bind:value={calcInput} class="w-20 py-[2px] px-4 border rounded-lg text-end">
            <button on:click|preventDefault={optionMultiply} class="px-2 text-lg border rounded">×</button>
            <button on:click|preventDefault={optionDivide} class="px-2 text-lg border rounded">÷</button>
            <button on:click|preventDefault={()=>{calcOpen = false}} class="px-2 text-lg border rounded">close</button>
        </div>
    {:else}
    <div class=" col-span-full left-[-26px] top-3 flex flex-row justify-evenly py-1 items-center">
        <!-- drag -->
        <div draggable="true" title="Drag to order options, first option is default" on:dragenter={handleDragEnter}  on:dragend={handleDragEnd} on:dblclick={dragTop} class="cursor-grabbing hover:cursor-grab">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-horizontal" viewBox="0 0 16 16">
                <path d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
        </div>

        <!-- calculator -->
        <button type="button" on:click|preventDefault = {handleCalcPress} on:keypress title="Open calculator to quick edit all numbers" >
            <div >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calculator-fill" viewBox="0 0 16 16">
                    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2 .5v2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-7a.5.5 0 0 0-.5.5zm0 4v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM4.5 9a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM4 12.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zM7.5 6a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM7 9.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zM10 6.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5zm.5 2.5a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1z"/>
                </svg>
            </div>
        </button>


        <!-- duplicate -->
        <button type="button" on:click|preventDefault={duplicate} title="Create duplicate of this option">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" >
                <path d="M14 7V7C14 6.06812 14 5.60218 13.8478 5.23463C13.6448 4.74458 13.2554 4.35523 12.7654 4.15224C12.3978 4 11.9319 4 11 4H8C6.11438 4 5.17157 4 4.58579 4.58579C4 5.17157 4 6.11438 4 8V11C4 11.9319 4 12.3978 4.15224 12.7654C4.35523 13.2554 4.74458 13.6448 5.23463 13.8478C5.60218 14 6.06812 14 7 14V14" stroke="#222222"/>
                <rect x="10" y="10" width="10" height="10" rx="2" stroke="#222222"/>
            </svg>
        </button>

        <!-- delete -->
        <button type="button" on:click|preventDefault = {remove} class="" title="Remove option">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="darkred">
                <path d="M10 15L10 12" stroke-width="2" stroke-linecap="round"/>
                <path d="M14 15L14 12" stroke-width="2" stroke-linecap="round"/>
                <path d="M3 7H21V7C20.0681 7 19.6022 7 19.2346 7.15224C18.7446 7.35523 18.3552 7.74458 18.1522 8.23463C18 8.60218 18 9.06812 18 10V16C18 17.8856 18 18.8284 17.4142 19.4142C16.8284 20 15.8856 20 14 20H10C8.11438 20 7.17157 20 6.58579 19.4142C6 18.8284 6 17.8856 6 16V10C6 9.06812 6 8.60218 5.84776 8.23463C5.64477 7.74458 5.25542 7.35523 4.76537 7.15224C4.39782 7 3.93188 7 3 7V7Z" stroke-width="2" stroke-linecap="round"/>
                <path d="M10.0681 3.37059C10.1821 3.26427 10.4332 3.17033 10.7825 3.10332C11.1318 3.03632 11.5597 3 12 3C12.4403 3 12.8682 3.03632 13.2175 3.10332C13.5668 3.17033 13.8179 3.26427 13.9319 3.37059" stroke-width="2" stroke-linecap="round"/>
            </svg>
                
        </button>
            
    </div>
{/if}

    <div bind:this={tooltipEl} id="tooltip" class="hidden absolute pb-[0.1rem] z-50 border rounded text-white bg-slate-600 text-center text-sm w-[53px] sm:w-[68px] min-w-fit px-1">
        {tooltipText}
    </div>

    <input type="text" placeholder="Measure" bind:value={option.measure} on:focusin={showTooltip} on:focusout={hideTooltip} class="h-10 px-2 py-1 text-sm rounded outline-none drop-shadow-sm focus:drop-shadow-md" title="Measure">
    <input type="number" inputmode="numeric" step="any" placeholder="Calories" bind:value={option.calories} on:focusin={showTooltip} on:focusout={hideTooltip} class="h-10 px-2 py-1 text-sm rounded outline-none drop-shadow-sm focus:drop-shadow-md" title="Calories">
    <input type="text" step="text" placeholder="Cost" bind:value={option.cost} on:focusin={showTooltip} on:focusout={hideTooltip} on:change={inlineCalc}  class="h-10 px-2 py-1 text-sm rounded outline-none drop-shadow-sm focus:drop-shadow-md" title="Cost">
    <input type="number" inputmode="numeric" step="any" placeholder="Protein" bind:value={option.protein} on:focusin={showTooltip} on:focusout={hideTooltip} class="h-10 px-2 py-1 text-sm rounded outline-none drop-shadow-sm focus:drop-shadow-md" title="Protein">
    <input type="number" inputmode="numeric" step="any" placeholder="Fat" bind:value={option.fat} on:focusin={showTooltip} on:focusout={hideTooltip} class="h-10 px-2 py-1 text-sm rounded outline-none drop-shadow-sm focus:drop-shadow-md" title="Fat">
    <input type="number" inputmode="numeric"  step="any" placeholder="Carbs" bind:value={option.carbs} on:focusin={showTooltip} on:focusout={hideTooltip} class="h-10 px-2 py-1 text-sm rounded outline-none drop-shadow-sm focus:drop-shadow-md" title="Carbs">
    <input type="text" placeholder="Description" bind:value={option.desc} class="h-10 px-2 py-1 col-span-6 text-sm rounded outline-none drop-shadow-sm focus:drop-shadow-lg" title="Description">
    
    
   
</div>


<style lang="scss">
    #tooltip{
        &::after{
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: rgb(71 85 105) transparent transparent transparent;

        }
    }
</style>