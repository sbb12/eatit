<script lang="ts">
    
    import CompressionSvg from "./CompressionSvg.svelte";
    
    export let image: Blob|null = null;
    export let imageChange: boolean = false;
    export let imageUrl: string|null = null;

    let imgInputEl: HTMLInputElement|null = null;
    let imgPreviewEl: HTMLDivElement|null = null;
    let imgEl: HTMLImageElement|null = null;


    let processingPicture = false;

    
    $: imageUrl && imageFromUrl(imageUrl)

    async function imageFromUrl(imageUrl: string|null){
        // check if the image is from our server
        if (imageUrl?.includes('pb.sercan.co.uk')) {
            imgEl && (imgEl.src = imageUrl);
            return
        };


        try{
            image = await compressImage(await getImageBlob(imageUrl));
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
    }
    
    // runs when the image preview is clicked
    function onImageClick(){
        imgInputEl?.click()
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
        imgPreviewEl?.classList.add('border-red-500');
        setTimeout(() => {
            imgPreviewEl?.classList.remove('border-red-500');
            setTimeout(() => {
                imgPreviewEl?.classList.add('border-red-500');
                setTimeout(() => {
                    imgPreviewEl?.classList.remove('border-red-500');
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




<input bind:this={imgInputEl} on:change={onImageChange} type="file" accept="image/jpg, image/png, image/jpeg, image/webp" class="hidden">

<div bind:this={imgPreviewEl} on:click={onImageClick} class=" cursor-pointer border-2 border-gray-400 border-dotted rounded w-[120px] h-[120px] flex items-center justify-center align-middle { image || imageUrl ? '' : 'bg-camera'}" on:keydown>
    <img bind:this={imgEl} src="{imageUrl}" class="{ image || imageUrl ? '' : 'hidden'}" alt="preview">
    {#if processingPicture}
        <CompressionSvg />
    {/if}
</div>