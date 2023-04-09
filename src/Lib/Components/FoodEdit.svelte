<script lang="ts">
	import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import CompressionSvg from './CompressionSvg.svelte';

    import { pb } from '../pb/pocketbase';

    export let id: string|null = null;
    export let apiData: any = null;

    let name: string;
    let barcode: string;
    let image = null;
    let imageUrl: string = '';
    let imageChange: boolean = false;
    let processingPicture: boolean = false;
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
                imageUrl = `https://pb.surgo.dev/api/files/${record.collectionId}/${record.id}/${record.image}?thumb=120x120`
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

        // check for name and options and image
        if (!name || options.length < 1 || (imageChange && !imgInputEl.files[0])) {
            return;
        }

        // create formdata
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


    /**
     * evals a string if it starts with an equal sign and ends with a semicolon.
     * @param {string} inputString - The input string to be evaluated.
     * @returns {string} - The evaluated string.
     */
    function calcInput(inputString: string) {
        if (inputString.match(/^=.+;/)){
            return eval(inputString.replace(/^=/, '').replace(/;$/, ''));
        } else {
            return inputString;
        }
    }


    // runs when the image preview is clicked
    function onImageClick(){
        imgInputEl.click()
    }


    /**
     * Handles the image input change event.
     * @async
     * @param {Event} e - The event object.
     * @returns {void}
     */
    async function onImageChange(e){
        // set flags
        imageChange = true;
        processingPicture = true;
        
        // grab the image file
        const file = e.target.files[0];

        try {
            // compress the image
            const newImglob = await compressImage(file);
            image = newImglob;
        } catch (e) {
            console.log('could not compress image', e);
        }

        // set the image preview
        if (image) {
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = function(e) {
                imgEl.src = e.target.result;
            }
        }

        // reset flags
        processingPicture = false;
    }

    /**
     * Handles the error when a user tries to create a food without an image.
     * @returns {void}
     */
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

    
    /**
     * Compresses, and resizes an image file, and returns the compressed image as a Blob.*
     * @async
     * @param {File} imgFile - The image file to be compressed and resized.
     * @param {number} [size=400] - The size of the output image's longer side (width or height).
     * @param {number} [quality=0.8] - number between 0 and 1 indicating compression quality
     * @returns {Promise<Blob|boolean>} A Promise that resolves with the compressed image Blob, or rejects with `false` if an error occurs during compression.
     */
    async function compressImage(imgFile, size = 800, quality = 0.9) {
        return new Promise(async (resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.readAsDataURL(imgFile);
                reader.onload = function (e) {
                    const img = new Image();
                    img.src = e.target.result;

                    img.onload = async () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = size;
                        canvas.height = size;

                        // resize and crop image to square at center
                        const ratio = img.width > img.height ? img.height / size : img.width / size;
                        const dx = img.width > img.height ? ((img.width / ratio) - size) / 2 : 0;
                        const dy = img.width > img.height ? 0 : ((img.height / ratio) - size) / 2;

                        ctx.drawImage(img, -dx, -dy, img.width / ratio , img.height / ratio);

                        try {
                            const newblob = await canvasToBlob(canvas, 'image/webp', quality);
                            resolve(newblob);
                        } catch (e) {
                            console.log('could not compress image', e);
                            reject(e);
                        }
                    }
                }
            } catch (e) {
                console.log('could not compress image', e);
                reject(e);
            }
        });
    }


    /**
     * Converts a canvas element to a Blob.
     * @async
     * @param {HTMLCanvasElement} canvas - The canvas element to be converted.
     * @param {string} [mimeType='image/webp'] - The MIME type of the image format to use for the output image.
     * @param {number} [quality=0.8] - number between 0 and 1 indicating compression quality
     * @returns {Promise<Blob>} A Promise that resolves with the canvas Blob, or rejects with an error if an error occurs during conversion.
     */
    function canvasToBlob(canvas, mimeType = 'image/webp', quality = 0.9) {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create a blob from the canvas.'));
                }
            }, mimeType, quality);
        });
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
            {#if processingPicture}
                <CompressionSvg />
            {/if}
        </div>

        <div class="flex flex-col mt-6">
            <input type="text" placeholder="Name" bind:value={name} class="h-10 px-2 py-1">
            <input type="text" placeholder="Barcode" bind:value={barcode} class="h-10 px-2 py-1 text-right bg-transparent">
        </div>
    </div>

    <div class="flex flex-col">
        {#each options as option, i} 
            <div class="grid grid-cols-6 my-4 gap-2 text-center border rounded-sm relative" id="option-{i}" draggable="true">
                <div class="absolute ml-[-21px] top-[35%] opacity-20 hover:opacity-100" title="move to top and make default choice" on:click={()=>{moveOptionTop(i)}} on:keypress draggable>
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

<!-- <canvas id="canvas" width="200" height="200"></canvas> -->
<div class="mx-auto my-20">
    
</div>


<style lang="scss">
    div{
        transition: all 0.3s linear;
    }
</style>