<template>
 <div class="ebook">
   <e-book-title/>
   <e-book-reader></e-book-reader>
   <e-book-menu/>
 </div>

</template>

<script>
import EBookReader from "@/components/ebook/EBookReader";
import EBookTitle from "@/components/ebook/EBookTitle";
import EBookMenu from "@/components/ebook/EBookMenu";
import {getReadTime, saveReadTime} from "@/utils/localStorage";
import {ebookMixin} from "@/utils/mixin";

export default {
  name: "index",
  mixins:[ebookMixin],
  components: {EBookMenu, EBookTitle, EBookReader},
  methods:{
    //记录阅读时间
    startLoopReadTime(){
      let readTime=getReadTime(this.fileName)
      if(!readTime)readTime=0
      this.task=setInterval(()=>{
        readTime++
        if(readTime%30==0){
          saveReadTime(this.fileName,readTime)
        }
      },1000)
    }
  },
  mounted() {
    this.startLoopReadTime()
  },
  beforeDestroy() {
    if(this.task)clearInterval(this.task)
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/styles/global";

.ebook {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>