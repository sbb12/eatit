<script lang="ts">
    export let open = false;
    export let onClick = (): void => {
        open = !open;
    };

    export let ariaLabel = 'toggle menu'
    export let width: string | number = 60
</script>


<button on:click={onClick} aria-expanded={open} aria-label={ariaLabel}>
    <svg
        class:open
        viewBox="0 0 100 100"
        fill="none"
        stroke="#222"
        stroke-width="4"
        {width}
    >
        <path
            class="top"
            d="m 30,33 h 40 c 3.722839,0 8.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20"
        />
        <path class="middle" d="m 30,50 h 40" />
        <path
            class="bottom"
            d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20"
        />
    </svg>
</button>
  
<style lang="scss">
        :root {
        --transition-duration: 400ms;
    }
    button {
        cursor: pointer;
        display: flex;
        align-items: center;
        overflow: hidden;
        z-index: 20;

        // margin: -12px -16px;

        @media screen and (min-width: 837px) {
            display: none;
        }
        
        .top {
            stroke-dasharray: 40 160;
            transition: stroke-dashoffset var(--transition-duration);
        }
        .middle {
            transform-origin: 50%;
            stroke-dasharray: 30 10;
            stroke-dashoffset: -10px;
            transition: transform var(--transition-duration), stroke-dashoffset var(--transition-duration);
        
        }
        .bottom {
            stroke-dasharray: 20 105;
            transition: stroke-dashoffset var(--transition-duration);
        }
        
        .open {
            transform: rotate(45deg);

            .top, .bottom {
                stroke-dashoffset: -66px;
            }
            .middle {
                transform: rotate(90deg);
                stroke-dasharray:38 10;
                stroke-dashoffset: -1px;
            }
        }
    }
  </style>