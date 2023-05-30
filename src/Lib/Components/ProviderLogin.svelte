<script lang="ts">
    export let provider: string;
</script>

<form class="w-full bg-gray-100 rounded py-2 flex border border-gray-300  hover:bg-gray-200  transition"  method="POST" action="?/OAuth2" >
    <input type="hidden" name="provider" value="{provider}">
    <button class="w-full inline-flex justify-center items-center"  type="submit">
        <slot />
        <p class="pl-4 hover:scale-100">{provider}</p>
    </button>
</form> 