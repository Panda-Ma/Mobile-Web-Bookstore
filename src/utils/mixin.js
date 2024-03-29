import {mapGetters, mapActions} from "vuex";
import {addCss, getReadTimeByMinute, removeAllCss, themeList} from "@/utils/book";
import {getBookmark, getBookShelf, saveBookShelf, saveLocation} from "@/utils/localStorage";
import { gotoBookDetail, appendAddToShelf, computeId, removeAddFromShelf } from './store'
import { shelf } from '../api/store'

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

       // 获取章节名称
        getSectionName() {
            return this.section ? this.navigation[this.section].label : ''
        }
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
            if (currentLocation && currentLocation.start) {
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

                //保存每一页的书签
                const bookmark = getBookmark(this.fileName)
                if (bookmark) {
                    if (bookmark.some(item => item.cfi === startCfi)) {
                        this.setIsBookmark(true)
                    } else {
                        this.setIsBookmark(false)
                    }
                } else {
                    this.setIsBookmark(false)
                }
            }
        },
        display(target, cb) {
            if (target) {
                //利用传入的位置参数，epubjs可以将书籍跳转到指定页数，同时会修改this.currentBook中的位置参数
                this.currentBook.rendition.display(target).then(() => {
                    this.refreshLocation()
                    //如果需要执行回调函数
                    if (cb) cb()
                })
            } else this.currentBook.rendition.display().then(() => {
                this.refreshLocation()
                if (cb) cb()
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

export const storeHomeMixin = {
    computed: {
        ...mapGetters([
            'offsetY',
            'hotSearchOffsetY',
            'flapCardVisible'
        ])
    },
    methods: {
        ...mapActions([
            'setOffsetY',
            'setHotSearchOffsetY',
            'setFlapCardVisible'
        ]),
        showBookDetail(book) {
            //路由跳转
            gotoBookDetail(this, book)
        }
    }
}


export const storeShelfMixin = {
    computed: {
        ...mapGetters([
            'isEditMode',
            'shelfList',
            'shelfSelected',
            'shelfTitleVisible',
            'offsetY',
            'shelfCategory',
            'currentType'
        ])
    },
    methods: {
        ...mapActions([
            'setIsEditMode',
            'setShelfList',
            'setShelfSelected',
            'setShelfTitleVisible',
            'setOffsetY',
            'setShelfCategory',
            'setCurrentType'
        ]),
        showBookDetail(book) {
            gotoBookDetail(this, book)
        },
        getCategoryList(title) {
            this.getShelfList().then(() => {
                const categoryList = this.shelfList.filter(book => book.type === 2 && book.title === title)[0]
                this.setShelfCategory(categoryList)
            })
        },
        getShelfList() {
            let shelfList = getBookShelf()       // 请求localStorage中的数据
            if (!shelfList) {
                //如果没有从mock中获取
                shelf().then(response => {
                    if (response.status === 200 && response.data && response.data.bookList) {
                        shelfList = appendAddToShelf(response.data.bookList)
                        saveBookShelf(shelfList) //保存到localStorage
                        return this.setShelfList(shelfList) //保存到vuex
                    }
                })
            } else {
                return this.setShelfList(shelfList) //保存到vuex
            }
        },
    }
}
