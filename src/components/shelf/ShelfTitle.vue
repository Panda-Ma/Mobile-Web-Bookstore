<template>
  <transition name="fade">
    <div class="shelf-title" :class="{'hide-shadow': ifHideShadow}" v-show="shelfTitleVisible">
      <div class="shelf-title-text-wrapper">
        <span class="shelf-title-text">{{ title }}</span>
        <span class="shelf-title-sub-text" v-show="isEditMode">{{ selectedText }}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showClear">
        <span class="shelf-title-btn-text" @click="clearCache">{{ $t('shelf.clearCache') }}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-right" v-if="showEdit">
        <span class="shelf-title-btn-text"
              @click="onEditClick">{{ isEditMode ? $t('shelf.cancel') : $t('shelf.edit') }}</span>
      </div>
      <div class="shelf-title-btn-wrapper shelf-title-left" v-if="showBack">
        <span class="icon-back" @click="back"></span>
      </div>
      <div class="shelf-title-btn-wrapper"
           :class="{'shelf-title-left': changeGroupLeft, 'shelf-title-right': changeGroupRight}" @click="changeGroup"
           v-if="showChangeGroup">
        <span class="shelf-title-btn-text">{{ $t('shelf.editGroup') }}</span>
      </div>
    </div>
  </transition>
  <div class="shelf-title-popup-warpper">
    <popup :title="popupTitle" :btn="popupBtn" ref="shelfTitlePopup"></popup>
  </div>
  <group-dialog ref="shelfTitleDialog" :show-new-group="showNewGroup" :group-name="groupName"></group-dialog>
  <teleport to="#app">
    <toast ref="shelfTitleToast"></toast>
  </teleport>
</template>

<script>
import {storeShelfMixin} from '@/utils/mixin'
import {clearLocalStorage, saveBookShelf} from '@/utils/localStorage'
import {clearLocalForage} from '@/utils/localForage'
import {appendAddToShelf, computeId, removeAddFromShelf} from "@/utils/store";
import Popup from "@/components/common/Popup"
import GroupDialog from "@/components/shelf/ShelfGroupDialog";
import Toast from "@/components/common/Toast";

export default {
  mixins: [storeShelfMixin],
  props: {
    title: String
  },
  computed: {
    emptyCategory() {
      return !this.shelfCategory || !this.shelfCategory.itemList || this.shelfCategory.itemList.length === 0
    },
    showEdit() {
      return this.currentType === 1 || !this.emptyCategory
    },
    showClear() {
      return this.currentType === 1
    },
    showBack() {
      return this.currentType === 2 && !this.isEditMode
    },
    showChangeGroup() {
      return this.currentType === 2 && (this.isEditMode || this.emptyCategory)
    },
    changeGroupLeft() {
      return !this.emptyCategory
    },
    changeGroupRight() {
      return this.emptyCategory
    },
    selectedText() {
      const selectedNumber = this.shelfSelected ? this.shelfSelected.length : 0
      // 国际化 替换占位符使用的是replace方法
      // 这里多次判断是因为在 英文状态下 书籍状态有单复数
      return selectedNumber <= 0 ? this.$t('shelf.selectBook') : (selectedNumber === 1 ? this.$t('shelf.haveSelectedBook').replace('$1', selectedNumber) : this.$t('shelf.haveSelectedBooks').replace('$1', selectedNumber))
    },
    popupCancelBtn() {
      return this.createPopupBtn(this.$t('shelf.cancel'), () => {
        this.hidePopup()
      })
    }
  },
  watch: {
    offsetY(offsetY) {
      if (offsetY > 0) {
        this.ifHideShadow = false
      } else {
        this.ifHideShadow = true
      }
    }
  },
  data() {
    return {
      ifHideShadow: true,
      popupTitle: null,
      popupBtn: null,
      showNewGroup: true,
      groupName: null
    }
  },
  components: {
    GroupDialog,
    Popup,
    Toast
  },
  methods: {
    onComplete() {
      this.hidePopup()
      this.setShelfList(this.shelfList.filter(book => book.id !== this.shelfCategory.id)).then(() => {
        saveBookShelf(this.shelfList)
        this.$router.go(-1)
        this.setIsEditMode(false)
      })
    },
    deleteGroup() {
      if (!this.emptyCategory) {
        this.setShelfSelected(this.shelfCategory.itemList)
        this.moveOutOfGroup(this.onComplete)
      } else {
        this.onComplete()
      }
    },
    async changeGroupName() {
      this.hidePopup()
      await (this.showNewGroup = true)
      await (this.groupName = this.shelfCategory.title)
      this.$refs.shelfTitleDialog.show()
    },
    hidePopup() {
      this.$refs.shelfTitlePopup.hide()
    },
    createPopupBtn(text, onClick, type = 'normal') {
      return {
        text: text,
        type: type,
        click: onClick
      }
    },
    showDeleteGroup() {
      this.hidePopup()
      setTimeout(() => {
        this.popupTitle = this.$t('shelf.deleteGroupTitle')
        this.popupBtn = [
          this.createPopupBtn(this.$t('shelf.confirm'), () => {
            this.deleteGroup()
          }, 'danger'),
          this.popupCancelBtn
        ]
        this.$refs.shelfTitlePopup.show()
      }, 200)
    },
    //修改分组
    changeGroup() {
      this.popupTitle = ''
      this.popupBtn = [
        this.createPopupBtn(this.$t('shelf.editGroupName'), () => {
          this.changeGroupName()
        }),
        this.createPopupBtn(this.$t('shelf.deleteGroup'), () => {
          this.showDeleteGroup()
        }, 'danger'),
        this.popupCancelBtn
      ]
      this.$refs.shelfTitlePopup.show()
    },
    back() {
      this.$router.go(-1)
      this.setIsEditMode(false)
    },
    onEditClick() {
      if (!this.isEditMode) {
        this.setShelfSelected([])
        this.shelfList.forEach(item => {
          item.selected = false
          if (item.itemList) {
            item.itemList.forEach(subItem => {
              subItem.selected = false
            })
          }
        })
      }
      this.setIsEditMode(!this.isEditMode)
    },
    clearCache() {
      clearLocalStorage()
      clearLocalForage()
      this.setShelfList([])
      this.setShelfSelected([])
      this.getShelfList() //由于数据被清除 ，书籍信息设置为mock中默认数据
      //toast提示
      this.$parent.$refs.shelfFooter.simpleToast(this.$t('shelf.clearCacheSuccess'));
    },
    moveOutOfGroup(f) {
      this.setShelfList(this.shelfList.map(book => {
        if (book.type === 2 && book.itemList) {
          book.itemList = book.itemList.filter(subBook => !subBook.selected)
        }
        return book
      })).then(() => {
        const list = computeId(appendAddToShelf([].concat(
            removeAddFromShelf(this.shelfList), ...this.shelfSelected)))
        this.setShelfList(list).then(() => {
          this.simpleToast(this.$t('shelf.moveBookOutSuccess'))
          if (f) f()
        })
      })
    },
    simpleToast(text) {
      this.$refs.shelfTitleToast.show()
      this.$refs.shelfTitleToast.updateText(text)
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";

.shelf-title {
  position: relative;
  z-index: 130;
  width: 100%;
  height: px2rem(42);
  background: white;
  box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, .1);

  &.hide-shadow {
    box-shadow: none;
  }

  .shelf-title-text-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: px2rem(42);
    @include columnCenter;

    .shelf-title-text {
      font-size: px2rem(16);
      line-height: px2rem(20);
      font-weight: bold;
      color: #333;
    }

    .shelf-title-sub-text {
      font-size: px2rem(10);
      color: #333;
    }
  }

  .shelf-title-btn-wrapper {
    position: absolute;
    top: 0;
    box-sizing: border-box;
    height: 100%;
    @include center;

    .shelf-title-btn-text {
      font-size: px2rem(14);
      color: #666;
    }

    .icon-back {
      font-size: px2rem(20);
      color: #666;
    }

    &.shelf-title-left {
      left: 0;
      padding-left: px2rem(15);
    }

    &.shelf-title-right {
      right: 0;
      padding-right: px2rem(15);
    }
  }
}
</style>
