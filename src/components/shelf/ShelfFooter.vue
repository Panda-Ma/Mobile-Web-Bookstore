<template>
  <div class="shelf-footer" v-show="isEditMode">
    <div class="shelf-footer-tab-wrapper" v-for="item in tabs" :key="item.index" @click="onTabClick(item)">
      <div class="shelf-footer-tab" :class="{'is-selected': isSelected}">
        <div class="icon-private tab-icon" v-if="item.index === 1 && !isPrivate"></div>
        <div class="icon-private-see tab-icon" v-if="item.index === 1 && isPrivate"></div>
        <div class="icon-download tab-icon" v-if="item.index === 2 && !isDownload"></div>
        <div class="icon-download-remove tab-icon" v-if="item.index === 2 && isDownload"></div>
        <div class="icon-move tab-icon" v-if="item.index === 3"></div>
        <div class="icon-shelf tab-icon" v-if="item.index === 4"></div>
        <div class="tab-text" :class="{'remove-text': item.index === 4}">{{ label(item) }}</div>
      </div>
    </div>
    <div class="shelf-footer-popup-wrapper">
      <popup :title="privateTitle" :btn="privateBtn" ref="private"></popup>
      <popup :title="downloadTitle" :btn="downloadBtn" ref="download"></popup>
      <popup :title="removeTitle" :btn="removeBtn" ref="remove"></popup>
    </div>
    <teleport to="#app">
      <toast ref="toast"></toast>
    </teleport>
  </div>
</template>

<script>
import {storeShelfMixin} from '@/utils/mixin'
import {saveBookShelf, removeLocalStorage} from '@/utils/localStorage'
import {download} from '@/api/store'
import {removeLocalForage} from '@/utils/localForage'
import Popup from "@/components/common/Popup";
import Toast from "@/components/common/Toast";

export default {
  components: {Toast, Popup},
  mixins: [storeShelfMixin],
  computed: {
    isSelected() {
      return this.shelfSelected && this.shelfSelected.length > 0
    },
    tabs() {
      return [
        {
          label: this.$t('shelf.private'),
          label2: this.$t('shelf.noPrivate'),
          index: 1
        },
        {
          label: this.$t('shelf.download'),
          label2: this.$t('shelf.delete'),
          index: 2
        },
        {
          label: this.$t('shelf.move'),
          index: 3
        },
        {
          label: this.$t('shelf.remove'),
          index: 4
        }
      ]
    },
    isPrivate() {
      if (!this.isSelected) {
        return false
      } else {
        return this.shelfSelected.every(item => item.private)
      }
    },
    isDownload() {
      if (!this.isSelected) {
        return false
      } else {
        return this.shelfSelected.every(item => item.cache)
      }
    }
  },
  data() {
    return {
      privateTitle: null,
      privateBtn: null,
      downloadTitle: null,
      downloadBtn: null,
      removeTitle: null,
      removeBtn: null,
    }
  },
  methods: {
    async downloadSelectedBook() {
      for (let i = 0; i < this.shelfSelected.length; i++) {
        await this.downloadBook(this.shelfSelected[i])
            .then(book => {
              book.cache = true
            })
      }
    },
    downloadBook(book) {
      this.$refs.toast.continueShow()
      return new Promise((resolve, reject) => {
        download(book, book => {
              resolve(book)
            }, reject, progressEvent => {
              //计算并显示进度
              const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
              let text = this.$t('shelf.progressDownload').replace('$1', `${book.fileName}.epub(${progress})`)
              this.$refs.toast.updateText(text)
            }
        )
      })
    },
    removeSelectedBook() {
      Promise.all(this.shelfSelected.map(book => this.removeBook(book)))
          .then(books => {
            books.map(book => {
              book.cache = false
            })
            saveBookShelf(this.shelfList)
            this.simpleToast(this.$t('shelf.removeDownloadSuccess'))
          })
    },
    removeBook(book) {
      return new Promise((resolve, reject) => {
        removeLocalStorage(`${book.categoryText}/${book.fileName}-info`)
        removeLocalForage(`${book.fileName}`)
        resolve(book)
      })
    },
    hidePopup() {
      this.$refs.private.hide()
      this.$refs.download.hide()
      this.$refs.remove.hide()
    },
    onComplete() {
      this.hidePopup()
      this.setIsEditMode(false)
      saveBookShelf(this.shelfList)
    },
    setPrivate() {
      let isPrivate
      if (this.isPrivate) {
        isPrivate = false
      } else {
        isPrivate = true
      }
      this.shelfSelected.forEach(book => {
        book.private = isPrivate
      })
      this.onComplete()
      if (isPrivate) {
        this.simpleToast(this.$t('shelf.setPrivateSuccess'))
      } else {
        this.simpleToast(this.$t('shelf.closePrivateSuccess'))
      }
    },
    async setDownload() {
      this.onComplete()
      if (this.isDownload) {
        this.removeSelectedBook()
      } else {
        await this.downloadSelectedBook() //异步方法 改为 同步，不然会对下面toast的同步方法造成影响
        saveBookShelf(this.shelfList)
        this.simpleToast(this.$t('shelf.setDownloadSuccess')) //同步方法
      }
    },
    removeSelected() {
      this.shelfSelected.forEach(selected => {
        this.setShelfList(this.shelfList.filter(book => book !== selected))
      })
      this.setShelfSelected([])
      this.onComplete()
    },
    showPrivate() {
      this.privateTitle = this.isPrivate ? this.$t('shelf.closePrivateTitle') : this.$t('shelf.setPrivateTitle')
      this.privateBtn = [
        {
          text: this.isPrivate ? this.$t('shelf.close') : this.$t('shelf.open'),
          click: () => {
            this.setPrivate()
          }
        },
        {
          text: this.$t('shelf.cancel'),
          click: () => {
            this.hidePopup()
          }
        }
      ]
      this.$refs.private.show()
    },
    showDownload() {
      this.downloadTitle = this.isDownload ? this.$t('shelf.removeDownloadTitle') : this.$t('shelf.setDownloadTitle')
      this.downloadBtn = [
        {
          text: this.isDownload ? this.$t('shelf.delete') : this.$t('shelf.open'),
          click: () => {
            this.setDownload()
          }
        },
        {
          text: this.$t('shelf.cancel'),
          click: () => {
            this.hidePopup()
          }
        }
      ]
      this.$refs.download.show()
    },
    showRemove() {
      if (this.shelfSelected.length === 1) {
        this.removeTitle = this.$t('shelf.removeBookTitle').replace('$1', `《${this.shelfSelected[0].title}》`)
      } else {
        this.removeTitle = this.$t('shelf.removeBookTitle').replace('$1', this.$t('shelf.selectedBooks'))
      }
      this.removeBtn = [
        {
          text: this.$t('shelf.removeBook'),
          type: 'danger',
          click: () => {
            this.removeSelected()
          }
        },
        {
          text: this.$t('shelf.cancel'),
          click: () => {
            this.hidePopup()
          }
        }
      ]
      this.$refs.remove.show()
    },
    onTabClick(item) {
      if (!this.isSelected) {
        return
      }
      switch (item.index) {
        case 1:
          this.showPrivate() //展示私密阅读
          break
        case 2:
          this.showDownload() //开启离线下载
          break
        case 3:
          this.dialog().show() //移动到
          break
        case 4:
          this.showRemove() //移出书架
          break
        default:
          break
      }
    },
    label(item) {
      switch (item.index) {
        case 1:
          return this.isPrivate ? item.label2 : item.label
        case 2:
          return this.isDownload ? item.label2 : item.label
        default:
          return item.label
      }
    },
    simpleToast(text) {
      this.$refs.toast.show()
      this.$refs.toast.updateText(text)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";

.shelf-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 120;
  display: flex;
  width: 100%;
  height: px2rem(48);
  background: white;
  box-shadow: 0 px2rem(-2) px2rem(4) 0 rgba(0, 0, 0, .1);

  .shelf-footer-tab-wrapper {
    flex: 1;
    width: 25%;
    height: 100%;

    .shelf-footer-tab {
      width: 100%;
      height: 100%;
      opacity: .5;
      @include columnCenter;

      &.is-selected {
        opacity: 1;
      }

      .tab-icon {
        font-size: px2rem(20);
        color: #666;
      }

      .tab-text {
        margin-top: px2rem(5);
        font-size: px2rem(12);
        color: #666;

        &.remove-text {
          color: $color-pink;
        }
      }

      .icon-shelf {
        color: $color-pink;
      }
    }
  }
}
</style>
