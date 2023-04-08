<script lang="ts">
	import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    import { pb } from '../pb/pocketbase';

    export let id: string|null = null;
    export let apiData: any = null;

    let name: string;
    let barcode: string;
    let image = null;
    let imageUrl: string = '';
    let imageChange: boolean = false;
    let options: any = [];
    

    let editingPicture: boolean = false;
    let imgInputEl: HTMLInputElement;
    let imgPreviewEl: HTMLDivElement;
    let imgEl: HTMLImageElement;

    const dispatch = createEventDispatcher();


    onMount(async () => {
        if (id) {
            getFood();
        } 
        if (apiData) {
            name = apiData.name;
            barcode = apiData.barcode;
            image = apiData.image;
            JSON.parse(apiData.options).forEach((option: any) => {
                options = [...options, {
                    measure: option.measure,
                    calories: option.calories,
                    protein: option.protein,
                    carbs: option.carbs,
                    fat: option.fat,
                    desc: option.desc,
                    cost: 0
                }]
            })
        }
        image = ''
    })

    function closed () {
        dispatch('close');
    }

    function removeOption(measure: string){
        options = options.filter((option: any) => option.measure !== measure);
    }

    async function getFood() {
        if (id){
            try {
                const record = await pb.collection('foods').getOne(id);
                name = record?.name;
                barcode = record?.barcode;
                imageUrl = `https:/pb.surgo.dev/api/files/${record.collectionId}/${record.id}/${record.image}?thumb=120x120`
                options = record?.options;
            } catch (e) {
                console.log('could not get record: ' + id, e)
            }
        }
    }

    function moveOptionTop(i:number){
        if (i > 0){
            const option = options[i];
            options = options.filter((option: any, index: number) => index !== i);
            options = [option, ...options];
        }
    }

    async function handleSubmit() {

        if (!name || options.length < 1 || (imageChange && !imgInputEl.files[0])) {
            return;
        }

        let formData = new FormData();
        formData.append('name', name);
        formData.append('options', JSON.stringify(options))

        // handle barcode and type
        if (barcode) {
            formData.append('barcode', barcode);
            formData.append('type', 'branded')
        } else {
            formData.append('type', 'basic')
        }
        
        if (imageChange){
            formData.append('image', imgInputEl.files[0]);
        }

        // console.log('formdata', formData.getAll())
        // return;

        // update if id exists else create
        if (id){
            try{
                const record = await pb.collection('foods').update(id, formData);
                dispatch('update', record);
            } catch (e) {
                console.log('could not update record: ' + id, e);
            }
        } else {
            // check for image
            if (!image){ 
                handleNoImageCreateError();
                return;
            }
            try {
                const record = await pb.collection('foods').create(formData);
                id = record.id;
                dispatch('create', record);
            } catch (e) {
                console.log('could not create record', e);
            }
        }
    }

    function calcInput(inputString: string) {
        if (inputString.match(/^=.+;/)){
            return eval(inputString.replace(/^=/, '').replace(/;$/, ''));
        } else {
            return inputString;
        }
    }

    function onImageClick(){
        imgInputEl.click()
    }

    function onImageChange(e){
        imageChange = true;
        image = e.target.files[0];

        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgEl.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }

    }

    function handleNoImageCreateError(){
        console.log('no image')
        imgPreviewEl.classList.add('border-red-500');
        setTimeout(() => {
            imgPreviewEl.classList.remove('border-red-500');
            setTimeout(() => {
                imgPreviewEl.classList.add('border-red-500');
                setTimeout(() => {
                    imgPreviewEl.classList.remove('border-red-500');
                }, 1000);
            }, 300);
        }, 300);
    }

</script>

<form class="bg-[#F6F6F6] p-4 w-[100%] max-w-[500px] z-50 relative" >
    <input type="hidden" bind:value={id}>
    <button class="absolute top-2 right-4" type="button" on:click|preventDefault={closed}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="darkred" class="w-6 h-6">
            <circle cx="12" cy="12" r="10" stroke="darkred" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7l10 10" />
        </svg> 
    </button>

    <div class="head flex flex-row items-center justify-between">
        {#if 0 && editingPicture}
            <input type="file" accept="image/jpg, image/png, image/jpeg, image/webp">
        {/if}

        <input bind:this={imgInputEl} on:change={onImageChange} type="file" accept="image/jpg, image/png, image/jpeg, image/webp" class="hidden">
        <div bind:this={imgPreviewEl} on:click={onImageClick} class="border-2 border-gray-400 border-dotted rounded w-[120px] h-[120px] flex items-center justify-center align-middle { image || imageUrl ? '' : 'bg-camera'}" on:keydown>
            <img bind:this={imgEl} src="{imageUrl}" class="{ image || imageUrl ? '' : 'hidden'}">
        </div>

        <div class="flex flex-col mt-6">
            <input type="text" placeholder="Name" bind:value={name} class="h-10 px-2 py-1">
            <input type="text" placeholder="Barcode" bind:value={barcode} class="h-10 px-2 py-1 text-right bg-transparent">
        </div>
    </div>

    <div class="flex flex-col">
        {#each options as option, i} 
            <div class="grid grid-cols-6 my-4 gap-2 text-center border rounded-sm relative">
                <div class="absolute ml-[-21px] top-[35%] opacity-20 hover:opacity-100" title="move to top and make default choice" on:click={()=>{moveOptionTop(i)}} on:keypress>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-up-short" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
                    </svg>
                </div>
                <input type="text" placeholder="Measure" bind:value={option.measure} class="h-10 px-2 py-1" title="Measure">
                <input type="number" inputmode="numeric" placeholder="Calories" bind:value={option.calories} on:change={() => {option.calories = calcInput(option.calories)}} class="h-10 px-2 py-1" title="Calories">
                <input type="number" inputmode="numeric" placeholder="Cost" bind:value={option.cost}  on:change={() => {option.cost = calcInput(option.cost)}} class="h-10 px-2 py-1" title="Cost">
                <input type="number" inputmode="numeric" placeholder="Protein" bind:value={option.protein} on:change={() => {option.protein = calcInput(option.protein)}}  class="h-10 px-2 py-1" title="Protein">
                <input type="number" inputmode="numeric" placeholder="Fat" bind:value={option.fat}  on:change={() => {option.fat = calcInput(option.fat)}} class="h-10 px-2 py-1" title="Fat">
                <input type="number" inputmode="numeric" placeholder="Carbs" bind:value={option.carbs}  on:change={() => {option.carbs = calcInput(option.carbs)}} class="h-10 px-2 py-1" title="Carbs">
                <input type="text" placeholder="Description" bind:value={option.desc} class="h-10 px-2 py-1 col-span-5" title="Description">
                <button class="mx-auto" type="button" on:click = {() => {removeOption(option.measure)}}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="darkred" class="w-6 h-6">
                        <circle cx="12" cy="12" r="10" stroke="darkred" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7l10 10" />
                    </svg> 
                </button>
            </div>
        {/each}

        <button on:click|preventDefault = {() => options = [...options, {}]} class="col-span-2 my-4 px-6 py-2 border border-purple-500 rounded-lg text-purple-500 font-semibold">New measure</button>
        
    </div>


    <div class="w-full inline-flex flex-row-reverse">
        <button on:click|preventDefault = {handleSubmit} class="px-6 py-2 border border-purple-500 rounded-lg text-purple-500 font-semibold">Submit</button>
    </div>
</form>



<style lang="scss">
    div{
        transition: all 0.3s linear;
    }
</style>