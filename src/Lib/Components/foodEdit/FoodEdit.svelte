<script lang="ts">
	import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { pb } from '../../pb/pocketbase';
    
    import ImageHandler from './ImageHandler.svelte';

    import Option from './Option.svelte';
    import type { OptionType } from '../../types/types'

    export let id: string|null = null;
    export let apiData: any = null;

    let name: string;
    let brands: string;
    let barcode: string;
    let image: Blob|null = null;
    let imageUrl: string = '';
    let imageChange: boolean = false;
    
    let options: OptionType[] = [];

    let imgEl: HTMLImageElement;

    const dispatch = createEventDispatcher();

    onMount(async () => {
        if (id) {
            getFood();
        } 
        if (apiData) {
            
            name = apiData.name;
            barcode = apiData.barcode;
            imageUrl = apiData.image_url;
            
            // processingPicture = true;
            // try{
            //     image = await compressImage(await getImageBlob(apiData.image_url));
            //     imageChange = true;
            //     if (image) {
            //         const reader = new FileReader();
            //         reader.readAsDataURL(image);
            //         reader.onload = function(e) {
            //             imgEl.src = e.target.result;
            //         }
            //     }
            // } catch (e) {
            //     console.log('could not fetch image', e)
            // }
            brands = apiData.brands.split(',').map((brand: string) => brand.trim()).map((brand:string) => brand.charAt(0).toUpperCase() + brand.slice(1)).join(', ');

            JSON.parse(apiData.options).forEach((option: any) => {
                options = [...options, {
                    measure: option.measure,
                    calories: Number(option.calories.toFixed(3)),
                    protein: Number(option.protein.toFixed(3)),
                    carbs: Number(option.carbs.toFixed(3)),
                    fat: Number(option.fat.toFixed(3)),
                    desc: option.desc,
                    cost: 0
                }]
            })
        }
    })


    function closed () {
        dispatch('close');
    }


    /**
     * remove an option from the array 
     * @param e custom event with the index of the option to remove
     */
    function removeOption(e: CustomEvent): void{
        options = options.filter((option, index) => e.detail !== index);
    }

    /**
     * populate the form with food data if we have an id
     * @async
     * @function getFood
     * */
    async function getFood(): Promise<void> {
        if (id){
            try {
                const record = await pb.collection('foods').getOne(id);
                name = record?.name;
                brands = record?.brands;
                barcode = record?.barcode;
                imageUrl = `https://pb.surgo.dev/api/files/${record.collectionId}/${record.id}/${record.image}?thumb=120x120`
                options = record?.options;
            } catch (e) {
                console.log('could not get record: ' + id, e)
            }
        }
    }


    /**
     * re-order the options array based on the position of the dragged element
     * @function handleImageChange
     * */
    function reOrderOption(e: CustomEvent): void{
        
        // check we have more than 1 option
        if (options.length < 2) {
            return;
        }

        // get the top position of all the option elements
        const optionEls = Array.from(document.querySelectorAll('.option'));
        const optionTopPositions = optionEls.map((optionEl: any) =>  {
            return {
                i: Number(optionEl.id.match(/[0-9]+/)),
                top: optionEl.getBoundingClientRect().top,
                height: optionEl.getBoundingClientRect().height
            }
        })        


        
        const draggedIndex = e.detail.i
        const dropY = e.detail.dropY;

        // check against positions of other options
        if (dropY < optionTopPositions[0].top - optionTopPositions[0].height) {
            // move to top
            const option = options[draggedIndex];
            options = options.filter((option: any, i: number) => i !== draggedIndex);
            options = [option, ...options];
        } else if (dropY > optionTopPositions[optionTopPositions.length - 1].top + optionTopPositions[optionTopPositions.length - 1].height) {
            // move to bottom
            const option = options[draggedIndex];
            options = options.filter((option: any, i: number) => i !== draggedIndex);
            options = [...options, option];
        } else {
            // find intersection
            optionTopPositions.forEach((optionTopPosition: any, i: number) => {
                if (dropY > optionTopPosition.top - optionTopPosition.height && dropY < optionTopPosition.top + optionTopPosition.height) {
                    const option = options[draggedIndex];
                    options = options.filter((option: any, i: number) => i !== draggedIndex);
                    options = [...options.slice(0, i), option, ...options.slice(i)];
                }
            })
        }
    }   

    /**
     * move an option to the top of the array 
     * @param e custom event with the index of the option to move
     */
    function optionTop(e: CustomEvent): void{
        const draggedIndex = e.detail

        const option = options[draggedIndex];
        options = options.filter((option: any, i: number) => i !== draggedIndex);
        options = [option, ...options];
    }

    /**
     * add an option to the array 
     * @param e custom event with the option to add
     */
    function addOption(e: CustomEvent): void{
        options = [...options, e.detail];
    }


    async function handleSubmit(): Promise<void> {

        // check for name and options and image
        if (!name || options.length < 1 || (imageChange && !image)) {
            return;
        }

        // create formdata
        let formData = new FormData();
        formData.append('name', name);
        formData.append('brands', brands)
        formData.append('options', JSON.stringify(options))

        // handle barcode and type
        if (barcode) {
            formData.append('barcode', barcode);
            formData.append('type', 'branded')
        } else {
            formData.append('type', 'basic')
        }
        
        // add image if changed or added
        if (imageChange){
            formData.append('image', image);
        }

        if (id){ // update
            try{
                const record = await pb.collection('foods').update(id, formData);
                dispatch('update', record);
            } catch (e) {
                console.log('could not update record: ' + id, e);
            }
        } else { // create
            
            // check for image
            if (!image){ 
                // handleNoImageCreateError();
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
        <ImageHandler bind:image bind:imageChange bind:imageUrl/>

        <div class="flex flex-col items-end mt-6">
            <label>
                <input type="text" placeholder="Brands" bind:value={brands} class="ml-auto h-10 px-2 my-1 rounded outline-none drop-shadow-sm focus:drop-shadow-lg" title="Brand(s separate by commas)">
            </label>
            <label>
                <input type="text" placeholder="Name" bind:value={name} class="ml-auto h-10 px-2 my-1 rounded outline-none drop-shadow-sm focus:drop-shadow-lg" title="Name">
            </label>
            <input type="text" placeholder="Barcode" bind:value={barcode} class="h-10 px-2 py-1 text-right bg-transparent">
        </div>
    </div>

    <div class="flex flex-col">
        
        {#each options as option, i} 
            <Option option={option} i={i} on:reOrderOption={reOrderOption} on:duplicate={addOption} on:remove={removeOption} on:dragTop={optionTop}/>
        {/each}

        <button on:click|preventDefault = {() => options = [...options, {}]} class="col-span-2 my-4 px-6 py-2 border border-purple-500 rounded-lg text-purple-500 font-semibold">New measure</button>
        
    </div>


    <div class="w-full inline-flex flex-row-reverse">
        <button on:click|preventDefault = {handleSubmit} class="px-6 py-2 border border-purple-500 rounded-lg text-purple-500 font-semibold">Submit</button>
    </div>
</form>

<!-- <canvas id="canvas" width="200" height="200"></canvas> -->
<div class="mx-auto my-20">
    
</div>


