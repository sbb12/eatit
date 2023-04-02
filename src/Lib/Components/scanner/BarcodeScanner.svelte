<script lang="ts">

    import { onMount, onDestroy } from "svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let vidEl: HTMLVideoElement;
    let formats;

    let barcode = '';
    let err = '';

    function startCam(){
        // check if device has camera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

            // camera facing out without audio
            const contraints = {
                video: {
                    facingMode: "environment"
                },
                audio: false
            };

            // start stream
            navigator.mediaDevices.getUserMedia(contraints).then(function(stream) {
                video.srcObject = stream;
            });

            // get supported formats
            formats = BarcodeDetector.getSupportedFormats().then((arr) => formats = arr)
            // create new detector
            const barcodeDetector = new BarcodeDetector({ formats: formats });
        }

        // Detect code function 
        const detectCode = () => {
            // Start detecting codes on to the video element
            barcodeDetector.detect(vidEl).then(codes => {
                if (codes.length === 0) return;

                for (const barcode of codes)  {
                    // Log the barcode to the console
                    console.log(barcode);
                }
            }).catch(error => {
                // Log an error if one happens
                console.error(error);
            })
        }
        setInterval(detectCode, 100);
    }

    function stopCam(){
        vidEl.srcObject.getTracks().forEach(track => track.stop());
    }

    function onScan(){
        stopCam();
        dispatch('scan', barcode);
    }


</script>


<video bind:this={vidEl}></video>