<template>
  <div class="ebook-reader">
    <div id="read"></div>
  </div>
</template>

<script>
import {ebookMixin} from "@/utils/mixin";
import Epub from 'epubjs'
import {
  getFontFamily,
  getFontSize, getLocation, getTheme,
  saveFontFamily,
  saveFontSize, saveTheme
} from "@/utils/localStorage";


global.ePub = Epub


export default {
  name: "EBookReader",
  mixins: [ebookMixin],
  methods: {
    prevPage() {
      if (this.rendition) {
        this.rendition.prev().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    nextPage() {
      if (this.rendition) {
        this.rendition.next().then(() => {
          this.refreshLocation()
        })
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
      const url = `${process.env.VUE_APP_RES_URL}/epub/` + this.fileName + '.epub'

      //实例化book对象
      this.book = new Epub(url)
      this.setCurrentBook(this.book)

      this.initRendition()
      this.initGesture()

      //  分页功能需要在书籍解析完成后
      this.book.ready.then(() => {
        return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
      }).then(() => {
        this.setBookAvailable(true)
        //虽然eBookReader中调用了refreshLocation，但是在分页功能加载完毕后才能调用成功
        this.refreshLocation()
      })


    },
    initFontSize() {
      //先判断localStorage中是否有此书的字体
      let fontSize = getFontSize(this.fileName)
      if (!fontSize) {
        //如果没有，将vuex中的默认值保存到local Storage中
        saveFontSize(this.fileName, this.defaultFontSize)
      } else {
        //如果有，epubJs渲染该字体
        this.rendition.themes.fontSize(fontSize)
        //保存到vuex
        this.setDefaultFontSize(fontSize)
      }
    },
    initFontFamily() {
      //先判断localStorage中是否有此书的字体
      let font = getFontFamily(this.fileName)
      if (!font) {
        //如果没有，将vuex中的默认值保存到local Storage中
        saveFontFamily(this.fileName, this.defaultFontFamily)
      } else {
        //如果有，epubJs渲染该字体
        this.rendition.themes.font(font)
        //保存到vuex
        this.setDefaultFontFamily(font)
      }
    },
    initTheme() {
      //先从local Storage中获取是否存在
      let defaultTheme = getTheme(this.fileName)
      //如果没有，获取默认vuex中的设置的默认值
      if (!defaultTheme) {
        defaultTheme = this.themeList[0].name
        //保存到local Storage
        saveTheme(this.fileName, defaultTheme)
      }
      //保存到vuex
      this.setDefaultTheme(defaultTheme)
      //iframe注册主题，以便后续可以切换主题
      //选择  utils/book  中的themeList 注册到iframe中
      this.themeList.forEach(theme => {
        this.rendition.themes.register(theme.name, theme.style)
      })

      //vuex是异步操作，所以不能用this.defaultTheme
      // this.rendition.themes.select(this.defaultTheme)
      this.rendition.themes.select(defaultTheme)
    },

    initRendition() {
      //渲染,获取id为read的对象
      this.rendition = this.book.renderTo('read', {
        width: innerWidth,
        height: innerHeight,
        method: 'default',
      })

      //获取local Storage中的进度
      const location=getLocation(this.fileName)

      this.display(location, () => {
        // 由于没有promise接口，这里利用箭头函数作为参数传入
        /**
         * 没有该操作，刷新页面会无法保存字体样式的设置
         */
        this.initTheme()
        this.initFontFamily()
        this.initFontSize()
        this.initGlobalStyle()
      })



      //在字体面板切换字体样式时需要挂载css文件，以link形式
      /**
       * 因为该Dom是嵌套在iframe中，所以需要通过以下方法加载css
       */
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
        ]).then(() => {
          // console.log('success');
        })

      })
    },
    initGesture() {
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
    },

  },
  mounted() {
    const fileName = this.$route.params.fileName.split('|').join('/')
    //保存书名到vuex
    this.setFileName(fileName).then(() => {
      this.initEpub()
    })
  }
}
</script>

<style scoped>

</style>