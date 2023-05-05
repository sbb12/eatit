<script lang="ts">
    import { backInOut, linear } from 'svelte/easing';
    import { slide } from 'svelte/transition';

let faqs = [
    {
      question: 'Account creation',
      answer: `
        While an account is required to track your nutrition and weight data, We do not need or store email addresses and any other personal data, so creating an account is as simple as just entering a username and a password.<br>
        Feel free to create a throwaway account if you just want to explore the site without commitment.`,
      isOpen: false,
    },
    {
      question: 'Navigating the site',
      answer: 'Once logged in, the nav bar will be available to you with links to the pages',
      isOpen: false,
    },
    {
        question: 'Tracking your nutrition',
        answer: `
            To track your nutrition, you will need to add meals to your day. You can do this by clicking the + button on the day tracker page. 

            You will then be able to search our database for foods and add it to your day. <br>
            You can also use the quick add feature to add a food name and calorie count to your day. This might be useful to add meals from restaurants or other foods that are not yet in our database. <br>
            If your browser supports it, you can scan the barcode of a product to add it to your day.`,
        isOpen: false,
    },
    {
        question: 'Product barcode scanning',
        answer: `
            When a barcode is scanned, the product is first searched in our database. If it is not found, an attempt to fetch the product data from the Open Food Facts API is made. <br>
            This will then prompt you to add the product to our database so it can be accessed much faster next time. <br>
            Where possible, the product data returned from the API will be used to populate the product form.`,
        isOpen: false,
    },
    {
        question: 'Development of this site',
        answer: `
            This is a personal project and very much still a work in progress. Features are being added and bugs are being fixed as I have time. <br>
            If you have any suggestions or find any bugs, please feel free to contact me at <a href="mailto:sercansokmen0@gmail.com">sercansokmen0@gmail.com</a>`,
        isOpen: false,
    }
   

    // ...
  ];

  function toggle(index) {
    faqs[index].isOpen = !faqs[index].isOpen;
  }

</script>



<section class="max-w-[800px] mx-auto flex flex-row justify-center items-center text-center">
    <div class="w-full my-4">
        {#each faqs as faq, index}
          <div class="mb-4">
            <div class="font-semibold text-lg cursor-pointer inline-flex" on:click={() => toggle(index)} on:keypress>
                <h2> {@html faq.question} </h2>
                <span class="w-10">{faq.isOpen ? '-' : '+'}</span>
            </div>
            {#if faq.isOpen}
              <p class="mt-2" transition:slide={{duration: 300, easing: linear}}>
                {@html faq.answer}
              </p>
            {/if}
          </div>
        {/each}
      </div>



</section>


<style lang="scss">
</style>