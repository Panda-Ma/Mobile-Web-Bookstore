<template>
  <div class="ebook" ref="ebook">
    <EBookHeader/>
    <e-book-title/>
    <e-book-reader></e-book-reader>
    <e-book-menu/>
    <e-book-bookmark/>
    <e-book-footer/>
  </div>

</template>

<script>
import EBookReader from "@/components/ebook/EBookReader";
import EBookTitle from "@/components/ebook/EBookTitle";
import EBookMenu from "@/components/ebook/EBookMenu";
import {getReadTime, saveReadTime} from "@/utils/localStorage";
import {ebookMixin} from "@/utils/mixin";
import EBookBookmark from "@/components/ebook/EBookBookmark";
import EBookHeader from "@/components/ebook/EBookHeader";
import EBookFooter from "@/components/ebook/EBookFooter";

export default {
  name: "index",
  mixins: [ebookMixin],
  components: {EBookFooter, EBookHeader, EBookBookmark, EBookMenu, EBookTitle, EBookReader},
  methods: {
    //记录阅读时间
    startLoopReadTime() {
      let readTime = getReadTime(this.fileName)
      if (!readTime) readTime = 0
      this.task = setInterval(() => {
        readTime++
        if (readTime % 30 == 0) {
          saveReadTime(this.fileName, readTime)
        }
      }, 1000)
    },
    move(v){
      this.$refs.ebook.style.top=v+'px'
    },
    restore(){
      this.$refs.ebook.style.top=0
      this.$refs.ebook.style.transition='all .2s linear'

      //屏幕回弹后记得去除transition，否则下拉会卡顿
      setTimeout(()=>{
        this.$refs.ebook.style.transition=''
      },200)
    }
  },
  mounted() {
    this.startLoopReadTime()
  },
  beforeDestroy() {
    if (this.task) clearInterval(this.task)
  },
  watch: { //watch监听
    // 监听用户下拉屏幕时滚动条的y轴数值
    //offsetY是一个定义在vuex中的变量
    offsetY(v) {
      // 判断如果菜单栏没有处于显示状态（如果菜单栏显示，优先响应菜单栏事件）
      // 并且电子书已经解析完毕(bookAvailable)（未解析完毕时无法获取currentLocation）
      if (!this.menuVisible && this.bookAvailable) {
        //偏移量offsetY大于0时为下拉
        if (v > 0) {
          // 向下拉动屏幕时，调用move方法
          this.move(v)
        } else if (v === 0) {
          // y轴为0时，调用restore方法让屏幕回弹，松手时屏幕是无法自动回弹的，必须自己实现
          this.restore()
        }
      }
    }
  },
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