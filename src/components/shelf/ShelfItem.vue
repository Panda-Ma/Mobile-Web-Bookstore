<template>
  <div class="shelf-item"
       :class="{'shelf-item-shadow': data.type === 1 || data.type === 2}"
       @click="onItemClick">
<!--    动态组件，根据不同状态选择不同组件-->
    <component class="shelf-item-comp"
               :class="{'is-edit': isEditMode && data.type === 2}"
               :is="item"
               :data="data"></component>
    <div class="icon-selected"
         :class="{'is-selected': data.selected}"
         v-show="isEditMode && data.type === 1"></div>
  </div>
</template>

<script>
  import { storeShelfMixin } from '@/utils/mixin'
  import ShelfBook from './ShelfItemBook'
  import ShelfCategory from './ShelfItemCategory'
  import ShelfAdd from './ShelfItemAdd'
  import { gotoStoreHome } from '@/utils/store'
  import {markRaw} from "vue";

  export default {
    mixins: [storeShelfMixin],
    props: {
      data: Object
    },
    computed: {
      item() {
        return this.data.type === 1 ? this.book : (this.data.type === 2 ? this.category : this.add)
      }
    },
    data() {
      return {
        book: markRaw(ShelfBook),
        category: markRaw(ShelfCategory),
        add: markRaw(ShelfAdd)
      }
    },
    methods: {
      //点击事件
      onItemClick() {
        if (this.isEditMode) {
          //点击 结果取反
          this.data.selected = !this.data.selected
          if (this.data.selected) {
            this.shelfSelected.pushWithoutDuplicate(this.data)
          } else {
            this.setShelfSelected(this.shelfSelected.filter(item => item.id !== this.data.id))
          }
        } else {
          if (this.data.type === 1) {
            this.showBookDetail(this.data)
          } else if (this.data.type === 2) {
            this.$router.push({
              path: '/store/category',
              query: {
                title: this.data.title
              }
            })
          } else {
            gotoStoreHome(this)
          }
        }
      }
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  @import "../../assets/styles/global";

  .shelf-item {
    position: relative;
    width: 100%;
    height: 100%;
    &.shelf-item-shadow {
      box-shadow: px2rem(2) px2rem(2) px2rem(6) px2rem(2) rgba(200, 200, 200, .3);
    }
    .shelf-item-comp {
      opacity: 1;
      &.is-edit {
        opacity: .5;
      }
    }
    .icon-selected {
      position: absolute;
      bottom: px2rem(2);
      right: px2rem(2);
      font-size: px2rem(18);
      color: rgba(0, 0, 0, .4);
      &.is-selected {
        color: $color-blue;
      }
    }
  }
</style>
