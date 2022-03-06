<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div class="ebook-reader-mask"
         @click="onMaskClick"
         @touchmove="move"
         @touchend="moveEnd"
         @mousedown.left="onMouseEnter"
         @mousemove.left="onMouseMove"
         @mouseup.left="onMouseEnd">
      <!--touchmove事件需要按住才生效，鼠标的mousemove事件只要移动就会生效，但是手机和电脑都会触发onMaskClick-->
    </div>
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
import {flatten} from "@/utils/book";


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

    initEpub() {
      //this.fileName是computed中的mappGetters通过Getter取到的
      const url = `${process.env.VUE_APP_RES_URL}/epub/` + this.fileName + '.epub'

      //实例化book对象
      this.book = new Epub(url)
      this.setCurrentBook(this.book)

      this.initRendition()
      // this.initGesture()
      this.parseBook()

      //  分页功能需要在书籍解析完成后
      this.book.ready.then(() => {
        return this.book.locations.generate(750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16))
      }).then(locations => {

        /**
         * 分页算法的简单实现，但是一般都交由后端处理，真实的分页算法很复杂
         * locations是分页信息
         * navigation是目录信息
         */
        //navigation中添加pagelist属性，初始化pagelist
        this.navigation.forEach(nav => {
          nav.pagelist = []
        })

        locations.forEach(item => {
          const loc = item.match(/\[(.*)\]!/)[1]

          this.navigation.forEach(nav => {
            if (nav.href) {
              //xxx.html
              const href = nav.href.match(/^(.*)\.html$/)[1]
              if (href === loc) {
                nav.pagelist.push(item)
              }
            }
          })

          //这里已经把每一章的分页放到navigation中，但是接下来需要计算章节开始的页数所在
          let currentPage = 1
          this.navigation.forEach((nav,index)=>{
            //第一章从第一页开始
            if(index===0)nav.page=1
            //加上 上一章的页数
            else nav.page=currentPage
            currentPage+=nav.pagelist.length+1
          })

        })
        /**
         * 分页算法end
         * EBookSlideContents.vue中，侧边栏可以看到每一章的页数位置所在 » {{item.page}}
         */

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
        //阅读模式设置，如果为scroll则是上下滑动，这里没有开发相应功能，default则为左右点击翻页
        method: 'default',
      })

      //获取local Storage中的进度
      const location = getLocation(this.fileName)

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

    //因为无法epubjs实现上拉，所以需要重新编写左滑、右滑、和上拉操作
    // initGesture() {
    //   //手势操作
    //   this.rendition.on('touchstart', event => {
    //     this.touchStartX = event.changedTouches[0].clientX
    //     this.touchStartTime = event.timeStamp
    //   })
    //   this.rendition.on('touchend', event => {
    //     const offsetX = event.changedTouches[0].clientX - this.touchStartX
    //     const time = event.timeStamp - this.touchStartTime
    //     // console.log(offsetX, time)
    //     if (time < 500 && offsetX > 40) {
    //       this.prevPage()
    //     } else if (time < 500 && offsetX < -40) {
    //       this.nextPage()
    //     } else {
    //       this.toggleTitleAndMenu()
    //     }
    //     //阻止默认事件
    //     event.preventDefault()
    //     //阻止事件传播
    //     event.stopPropagation()
    //   })
    // },


    //下方菜单栏的目录面板解析
    parseBook() {
      //解析封面图片
      this.book.loaded.cover.then(cover => {
        this.book.archive.createUrl(cover).then(url => {
          this.setCover(url)
        })
      })

      //解析书籍信息
      this.book.loaded.metadata.then(metadata => {
        this.setMetadata(metadata)
      })

      //解析目录
      this.book.loaded.navigation.then(nav => {
        const navItem = flatten(nav.toc)

        //查找一个索引为第几级目录
        function find(item, level = 0) {
          //如果一个索引存在父节点，则查找该父节点
          let getParent = item => navItem.filter(parentItem => parentItem.id === item.parent)[0]

          return !item.parent ? level : find(getParent(item), ++level)
        }

        //标注一维数组的每个索引 为 第几级目录
        navItem.forEach(item => {
          item.level = find(item)
        })

        this.setNavigation(navItem)
      })


    },

    //手势操作重新编写：上下页的点击或者点击显示功能和菜单栏
    onMaskClick(e) {
      //电脑的鼠标操作，如果鼠标正在下拉时阻止翻页
      if (this.mouseState && (this.mouseState === 2 || this.mouseState === 3)) return
      //x轴上的偏移量
      const offsetX = e.offsetX
      const width = window.innerWidth
      //单击可以上下一页
      if (offsetX > 0 && offsetX < width * 0.3) this.prevPage()
      else if (offsetX > 0 && offsetX > width * 0.7) this.nextPage()
      else this.toggleTitleAndMenu()
    },

    //下滑操作
    move(e) {
      let offsetY = 0
      //client浏览器视口内部的坐标
      if (this.firstOffsetY) {
        offsetY = e.changedTouches[0].clientY - this.firstOffsetY
        this.setOffsetY(offsetY)
      } else {
        this.firstOffsetY = e.changedTouches[0].clientY
      }
      e.preventDefault()
      e.stopPropagation()
    },

    //结束下滑滑动时重置属性
    moveEnd(e) {
      this.setOffsetY(0)
      this.firstOffsetY = null
    },


    //onMouse是电脑鼠标的三个操作
    //1：鼠标进入
    //2：鼠标进入后移动
    //3：鼠标从移动状态松手
    //4：鼠标还原
    onMouseEnter(e) {
      this.mouseState = 1
      this.mouseStartTime = e.timeStamp
      e.preventDefault()
      e.stopPropagation()
    },
    onMouseMove(e) {
      if (this.mouseState === 1) {
        this.mouseState = 2
      } else if (this.mouseState === 2) {
        let offsetY = 0
        //client浏览器视口内部的坐标
        if (this.firstOffsetY) {
          offsetY = e.clientY - this.firstOffsetY
          this.setOffsetY(offsetY)
        } else {
          this.firstOffsetY = e.clientY
        }
        e.preventDefault()
        e.stopPropagation()
      }

      e.preventDefault()
      e.stopPropagation()
    },
    onMouseEnd(e) {
      if (this.mouseState === 2) {
        this.setOffsetY(0)
        this.firstOffsetY = null
        this.mouseState = 3
      } else this.mouseState = 4

      //优化点击的体验
      const time = e.timeStamp - this.mouseStartTime
      if (time < 100) this.mouseState = 4

      e.preventDefault()
      e.stopPropagation()
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


<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";

.ebook-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .ebook-reader-mask {
    position: absolute;
    top: 0;
    left: 0;
    background: transparent;
    z-index: 150;
    width: 100%;
    height: 100%;
  }
}
</style>