<script lang="ts">

    import { onMount, onDestroy } from "svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let cameraOverlayEl: HTMLElement;
    let vidEl: HTMLVideoElement;
    let mediaStream;
    let formats = ['code_128', 'code_39', 'code_93', 'codabar', 'data_matrix', 'ean_13', 'ean_8', 'itf', 'pdf417', 'qr_code', 'upc_a', 'upc_e', 'aztec'];
    
    let err = '';
    let status = '';
    let code = '';

    onDestroy(() => {
        stopCam();
    })

    async function startCam(){
        const barcode = '4088600354842';
        dispatch('scanned', barcode);
        return;

        cameraOverlayEl.classList.remove('hidden');

        navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}, audio: false})
        .then((stream) => {
            mediaStream = stream;
            vidEl.srcObject = mediaStream;
        })

        const barcodeDetector = new BarcodeDetector({ formats: formats });
        detectCode(barcodeDetector);
    }

    function stopCam(){
        status = 'stopped';
        cameraOverlayEl.classList.add('hidden');
        vidEl.srcObject.getTracks().forEach(track => track.stop());
    }

    function onScan(barcode: string ){
        console.log(barcode)
        stopCam();
        dispatch('scanned', barcode);
    }

    function detectCode(barcodeDetector){
        if (vidEl.readyState) {
            status = 'scanning'
            barcodeDetector.detect(vidEl)
            .then(barcodes => {
                err = 'found barcodes ' + barcodes.length
                if (barcodes.length > 0) {
                    onScan(barcodes[0].rawValue)
                    return;
                }
            })
            .catch(error => {
                console.log(error);
            });
        } else {
            status = 'initializing video stream';
        }

        setTimeout(() => {
            detectCode(barcodeDetector);
        }, 100);
    }

</script>
<div class="m-auto my-4">
    <button on:click={startCam}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-camera" viewBox="0 0 16 16">
            <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
            <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
        </svg> 
    </button>
</div>

{err} <br>
{status}

<div bind:this={cameraOverlayEl} class="hidden fixed top-0 left-0 z-50 w-full h-full bg-gray-200">
    <button class="absolute top-0 right-0 m-4 text-red" on:click={stopCam}>❌</button>
    <video bind:this={vidEl} autoplay></video>
    <div>
        <button on:click={stopCam} class=" border-teal-300 border-solid">Stop</button>
    </div>
    <div>
        {err} <br>
        {status} <br>
        {code}
    </div>
</div>

