<script lang="ts">

    import { currentUser, pb } from '../../pb/pocketbase';
    import { createEventDispatcher } from 'svelte';   
	import BarcodeScanner from './BarcodeScanner.svelte';
	import FoodEdit from '../FoodEdit.svelte';

    const dispatch = createEventDispatcher();
    export let dayID: string;
    let msg: string = '';
    let promptAdd = false;
    let apiData;

    async function onScan(event: CustomEvent<{barcode: string}>){
        const barcode = event.detail
        
        msg = 'found barcode: ' + barcode + ' searching...';

        // check if we have it in our db
        try{ 
            const record = await pb.collection('foods').getFirstListItem(`barcode = "${barcode}"`);
            if (record) {
                
                let option = record.options[0];
                
                const data = {
                    name: record.name,
                    food_id: record.id,
                    quantity: 1,
                    measure: option.measure,
                    calories: option.calories,    
                    protein: option.protein,
                    carbs: option.carbs,
                    fat: option.fat,
                    cost: option.cost,
                    food:  record
                }   
                dispatch('addFood', data);
                msg = '';
            }
        }
        catch { // food not in database, we need toprompt user to add it
            msg = 'Food not in our database, searching online...'
            fetchProduct(barcode);
        }

    }

    async function fetchProduct(code: string) {

        // check food facts api
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
        
        if (!response.ok) {
            msg = 'Could not fetch product, enter manually?'
            promptProductEntry();
            return;
        }

        const data = await response.json();

        // check if data is valid
        if (data.status === 0) {
            msg = 'Could not find product, enter manually?'
            promptProductEntry();
            return;
        }

        msg = 'Product found, parsing...'

        const servings = []

        // check for serving sizes
        if (data.product.nutriments['energy-kcal_serving']) {
            servings.push({
                measure: 'serving',
                calories: data.product.nutriments['energy-kcal_serving'],
                protein: data.product.nutriments.proteins_serving,
                carbs: data.product.nutriments.carbohydrates_serving,
                fat: data.product.nutriments.fat_serving,
                desc: data.product.serving_size ? data.product.serving_size : Math.round(100 * parseInt(data.product.nutriments['energy-kcal_serving']) / parseInt(data.product.nutriments['energy-kcal_100g']))                
            })
        }
        if (data.product.nutriments['energy-kcal_prepared_serving']) {
            servings.push({
                measure: 'serving',
                calories: data.product.nutriments['energy-kcal_prepared_serving'],
                protein: data.product.nutriments.prepared_proteins_serving,
                carbs: data.product.nutriments.prepared_carbohydrates_serving,
                fat: data.product.nutriments.prepared_fat_serving,
                desc:  data.product.prepared_serving_size ? data.product.serving_size :  Math.round(100 * parseInt(data.product.nutriments['energy-kcal_prepared_serving']) / parseInt(data.product.nutriments['energy-kcal_100g']))                    
            })
        }
        if (data.product.nutriments['energy-kcal_100g']) {
            servings.push({
                measure: 'g',
                calories: data.product.nutriments['energy-kcal_100g'] / 100,
                protein: data.product.nutriments.proteins_100g / 100,
                carbs: data.product.nutriments.carbohydrates_100g / 100,
                fat: data.product.nutriments.fat_100g / 100,
                desc: ''                  
            })
        }

        // parse data 
        const product = {
            name: data.product.product_name,
            barcode: data.product.code,
            image: data.product.image_url,
            options: JSON.stringify(servings)
        }

        msg = 'Product found online, add to database?'
        promptProductEntry(product);

    }

    function promptProductEntry(data = null){
        apiData = data;
        promptAdd = true;
    }

    function onSave(event){
        if (event.detail.action === 'added') {
            console.log('added food to database');
        } else if (event.detail.action === 'closed') {
            promptAdd = false;
            msg = '';
        }
    }

    function addEntry(event: CustomEvent){
        console.log('add entry', event.detail)
        
        const data = {
            name: event.detail.name,
            food_id: event.detail.id,
            quantity: 1,
            measure: event.detail.options[0].measure,
            calories: event.detail.options[0].calories,
            protein: event.detail.options[0].protein,
            carbs: event.detail.options[0].carbs,
            fat: event.detail.options[0].fat,
            cost: event.detail.options[0].cost,
            food: event.detail
        }

        dispatch('addFood', data);
        promptAdd = false;
        msg = '';
    }





</script>



<BarcodeScanner on:scanned={onScan}/>
{#if msg}
    <overlay class="absolute top-0 left-0 z-40 w-full h-full backdrop-blur-lg opacity-20 bg-black "></overlay>
    <div class="absolute top-0 left-0 p-1 w-full h-full flex justify-center items-center">
        {msg}
    </div>
{/if}

{#if promptAdd}
    <overlay class="absolute top-0 left-0 z-40 w-full h-full backdrop-blur-lg opacity-80 bg-black "></overlay>
    <div class="absolute top-0 left-0 p-1 w-full h-full flex justify-center items-center">
        {msg}
        <FoodEdit {apiData} on:create={addEntry} on:save={onSave} on:close={() => {promptAdd = false; msg=''}}/>
    </div>
{/if}

