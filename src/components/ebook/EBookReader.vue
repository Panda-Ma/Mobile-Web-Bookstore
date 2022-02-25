<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
import {ebookMixin} from "@/utils/mixin";
import Epub from 'epubjs'

global.ePub = Epub


export default {
  name: "EBookReader",
  mixins: [ebookMixin],
  methods: {
    prevPage() {
      if (this.rendition) {
        this.rendition.prev()
        this.hideTitleAndMenu()
      }
    },
    nextPage() {
      if (this.rendition) {
        this.rendition.next()
        this.hideTitleAndMenu()
      }
    },
    //切换菜单栏和标题的显示状态
    toggleTitleAndMenu() {
      // this.$store.dispatch('setMenuVisible', !this.menuVisible)
      this.setMenuVisible(!this.menuVisible)
      this.setSettingVisible(-1)
      this.setFontFamilyVisible(false)
    },
    hideTitleAndMenu() {
      // this.$store.dispatch('setMenuVisible',false)
      this.setMenuVisible(false)
      this.setSettingVisible(-1)
      this.setFontFamilyVisible(false)
    },
    initEpub() {
      //this.fileName是computed中的mappGetters通过Getter取到的
      const url = 'http://localhost:8081/epub/' + this.fileName + '.epub'
      // console.log(url)

      //实例化book对象
      this.book = new Epub(url)
      this.setCurrentBook(this.book)
      // console.log(this.book);
      // console.log(this)

      //渲染,获取id为read的对象
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default',
        // flow: "paginated",
        // manager: "continuous",
        // snap: true
      })
      this.rendition.display()

      //手势操作
      this.rendition.on('touchstart', event => {
        this.touchStartX = event.changedTouches[0].clientX
        this.touchStartTime = event.timeStamp
      })
      this.rendition.on('touchend', event => {
        const offsetX = event.changedTouches[0].clientX - this.touchStartX
        const time = event.timeStamp - this.touchStartTime
        // console.log(offsetX, time)
        if (time < 500 && offsetX > 40) {
          this.prevPage()
        } else if (time < 500 && offsetX < -40) {
          this.nextPage()
        } else {
          this.toggleTitleAndMenu()
        }
        //阻止默认事件
        event.preventDefault()
        //阻止事件传播
        event.stopPropagation()
      })
      //在字体面板切换字体样式时需要挂载css文件，以link形式
      this.rendition.hooks.content.register(contents => {
        Promise.all([
          // contents.addStylesheet('http://localhost:8081/font/daysOne.css'),
          // contents.addStylesheet('http://localhost:8081/font/cabin.css'),
          // contents.addStylesheet('http://localhost:8081/font/montserrat.css'),
          // contents.addStylesheet('http://localhost:8081/font/tangerine.css'),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/font/daysOne.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/font/cabin.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/font/montserrat.css`),
          contents.addStylesheet(`${process.env.VUE_APP_RES_URL}/font/tangerine.css`),
        ]).then(()=>{
          console.log('success');
        })

      })
    }
  },
  mounted() {
    const fileName = this.$route.params.fileName.split('|').join('/')
    this.setFileName(fileName).then(() => {
      this.initEpub()
    })
  }
}
</script>

<style scoped>

</style>