import {mapGetters, mapActions} from "vuex";
import {addCss, getReadTimeByMinute, removeAllCss, themeList} from "@/utils/book";
import {saveLocation} from "@/utils/localStorage";

export const ebookMixin = {
    computed: {
        ...mapGetters([
            'fileName',
            'menuVisible',
            'settingVisible',
            'defaultFontSize',
            'defaultFontFamily',
            'fontFamilyVisible',
            'defaultTheme',
            'bookAvailable',
            'progress',
            'section',
            'isPaginating',
            'currentBook',
            'navigation',
            'cover',
            'metadata',
            'paginate',
            'pagelist',
            'offsetY',
            'isBookmark'
        ]),
        themeList() {
            return themeList(this)
        },
        // getSectionName() {
        //     return this.section ? this.navigation[this.section].label : ''
        // }
    },
    methods: {
        ...mapActions([
            'setFileName',
            'setMenuVisible',
            'setSettingVisible',
            'setDefaultFontSize',
            'setDefaultFontFamily',
            'setFontFamilyVisible',
            'setDefaultTheme',
            'setBookAvailable',
            'setProgress',
            'setSection',
            'setIsPaginating',
            'setCurrentBook',
            'setNavigation',
            'setCover',
            'setMetadata',
            'setPaginate',
            'setPagelist',
            'setOffsetY',
            'setIsBookmark'
        ]),
        //阅读器整体的样式，如控制面板的颜色
        initGlobalStyle() {
            removeAllCss()
            switch (this.defaultTheme) {
                case 'Default':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
                    break
                case 'Eye':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_eye.css`)
                    break
                case 'Gold':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_gold.css`)
                    break
                case 'Night':
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_night.css`)
                    break
                default:
                    addCss(`${process.env.VUE_APP_RES_URL}/theme/theme_default.css`)
                    break
            }
        },
        //点击上下一章时需要刷新进度条百分比
        refreshLocation() {
            const currentLocation = this.currentBook.rendition.currentLocation()
            if (currentLocation&&currentLocation.start) {
                //startCfi为当前进度
                const startCfi = currentLocation.start.cfi
                //将当前章节的开始位置 或者 当前位置转化为书籍的进度百分比
                const progress = this.currentBook.locations.percentageFromCfi(startCfi)
                //progress保存到vuex
                this.setProgress(Math.floor(progress * 100))
                //section保存到vuex
                this.setSection(currentLocation.start.index)
                //保存到local Storage
                saveLocation(this.fileName, startCfi)
            }
        },
        display(target,cb){
            if(target) {
                //利用传入的位置参数，epubjs可以将书籍跳转到指定页数，同时会修改this.currentBook中的位置参数
                this.currentBook.rendition.display(target).then(() => {
                    this.refreshLocation()
                    //如果需要执行回调函数
                    if (cb) cb()
                })
            }
            else  this.currentBook.rendition.display().then(()=>{
                this.refreshLocation()
                if(cb)cb()
            })
        },
        hideTitleAndMenu() {
            // this.$store.dispatch('setMenuVisible',false)
            this.setMenuVisible(false)
            this.setSettingVisible(-1)
            this.setFontFamilyVisible(false)
        },
        getReadTimeText() {
            return this.$t('book.haveRead').replace('$1', getReadTimeByMinute(this.fileName))
        },
    }
}