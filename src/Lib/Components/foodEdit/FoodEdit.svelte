<script lang="ts">
	import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    
    import CompressionSvg from './CompressionSvg.svelte';
    import Option from './Option.svelte';
    
    import type { OptionType } from '../../types/types'
    import { pb } from '../../pb/pocketbase';

    export let id: string|null = null;
    export let apiData: any = null;

    let name: string;
    let brands: string;
    let barcode: string;
    let image: Blob|null = null;
    let imageUrl: string = '';
    let imageChange: boolean = false;
    let processingPicture: boolean = false;
    
    let options: OptionType[] = [];

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
            processingPicture = true;
            try{
                image = await compressImage(await getImageBlob(apiData.image_url));
                imageChange = true;
                if (image) {
                    const reader = new FileReader();
                    reader.readAsDataURL(image);
                    reader.onload = function(e) {
                        imgEl.src = e.target.result;
                    }
                }
            } catch (e) {
                console.log('could not fetch image', e)
            }
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


    // runs when the image preview is clicked
    function onImageClick(){
        imgInputEl.click()
    }

    // returns image blob from url
    async function getImageBlob(imgSrc: string): Promise<Blob> {
        const response = await fetch(imgSrc);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        return blob;
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
    async function compressImage(imgFile, size = 800, quality = 0.9): Promise<Blob> {
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
            <img bind:this={imgEl} src="{imageUrl}" class="{ image || imageUrl ? '' : 'hidden'}" alt="preview">
            {#if processingPicture}
                <CompressionSvg />
            {/if}
        </div>

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


