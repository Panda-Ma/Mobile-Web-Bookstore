<template>
 <div class="ebook"></div>
  <e-book-title/>
  <e-book-reader></e-book-reader>
  <e-book-menu/>
</template>

<script>
import EBookReader from "@/components/ebook/EBookReader";
import EBookTitle from "@/components/ebook/EBookTitle";
import EBookMenu from "@/components/ebook/EBookMenu";
export default {
  name: "index",
  components: {EBookMenu, EBookTitle, EBookReader}
}
</script>

<style scoped lang="scss">
@import "../../assets/style/global";

.ebook {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>