<template>
  <div>
    <div class="search-bar" :class="{'hide-title': !titleVisible, 'hide-shadow': !shadowVisible}">
      <transition name="title-move">
        <div class="search-bar-title-wrapper" v-show="titleVisible">
          <div class="title-text-wrapper">
            <span class="title-text title">{{ $t('home.title') }}</span>
          </div>
          <div class="title-icon-shake-wrapper" @click="showFlapCard">
            <span class="icon-shake icon"></span>
          </div>
        </div>
      </transition>
      <div class="title-icon-back-wrapper" :class="{'hide-title': !titleVisible}" @click="back">
        <span class="icon-back icon"></span>
      </div>
      <div class="search-bar-input-wrapper" :class="{'hide-title': !titleVisible}">
        <!--虚拟dom，占位使用，下滑时需要input变窄-->
        <div class="search-bar-blank" :class="{'hide-title': !titleVisible}"></div>
        <div class="search-bar-input">
          <span class="icon-search icon"></span>
          <input class="input"
                 type="text"
                 :placeholder="$t('home.hint')"
                 v-model="searchText"
                 @click="showHotSearch"
                 @keypress.enter.exact="search()">
          <!--       13：回车键 exact：只能点击该键，其他键无效。    -->
          <!--          vue新版本不再支持使用数字 (即键码) 作为 v-on 修饰符，可以查看 按键修饰符-->
          <!--          原本这里用的是keyup，但是keyup在输入中文时按下回车就会自动提交，影响实际使用-->
        </div>
      </div>
    </div>
    <hot-search-list v-show="hotSearchVisible" ref="hotSearch"></hot-search-list>
  </div>
</template>


<script>
import {storeHomeMixin} from "@/utils/mixin";
import HotSearchList from "@/components/home/HotSearchList";


export default {
  name: "SearchBar",
  mixins: [storeHomeMixin],
  components: {
    HotSearchList
  },
  data() {
    return {
      searchText: '',
      titleVisible: true,
      shadowVisible: false,
      hotSearchVisible: false
    }
  },
  watch: {
    //监听StoreHome中保存到vuex中的offsetY
    offsetY(offsetY) {
      if (offsetY > 0) {
        this.hideTitle()
        this.hideShadow()
      } else {
        this.showTitle()
        this.showShadow()
      }
    },
    hotSearchOffsetY(offsetY) {
      if (offsetY > 0) {
        this.showShadow()
      } else {
        this.hideShadow()
      }
    }
  },
  methods: {
    hideTitle() {
      this.titleVisible = false
    },
    showTitle() {
      this.titleVisible = true
    },
    hideShadow() {
      this.shadowVisible = false
    },
    showShadow() {
      this.shadowVisible = true
    },
    hideHotSearch() {
      this.hotSearchVisible = false
      if (this.offsetY > 0) {
        this.hideTitle()
        this.showShadow()
      } else {
        this.showTitle()
        this.hideShadow()
      }
    },
    showHotSearch() {
      //这三个操作不会使dom立即更新
      this.hideTitle()
      this.hideShadow()
      this.hotSearchVisible = true


      //使hotSearch返回最顶部
      //nextTick()，是将回调函数延迟在下一次dom更新数据后调用，简单的理解是：当数据更新了，在dom中渲染后，自动执行该函数
      this.$nextTick(() => {
        this.$refs.hotSearch.reset()

      })
    },
    back() {
      if (this.offsetY > 0) {
        this.showShadow()
      } else {
        this.hideShadow()
      }
      if (this.hotSearchVisible)
        this.hideHotSearch()
      else this.$router.push('/store/shelf')
    },
    showFlapCard() {
      this.setFlapCardVisible(true)
    },
    search() {
      console.log(this.searchText);
      this.$router.push({
        path: '/store/list',
        query: {
          keyword: this.searchText
        }
      })
    }

  }

}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";

.search-bar {
  position: relative;
  z-index: 150;
  width: 100%;
  height: px2rem(94);
  box-shadow: 0 px2rem(2) px2rem(2) 0 rgba(0, 0, 0, .1);

  &.hide-title {
    height: px2rem(52);
  }

  &.hide-shadow {
    box-shadow: none;
  }

  .search-bar-title-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: px2rem(42);

    .title-text-wrapper {
      width: 100%;
      height: px2rem(42);
      @include center;
    }

    .title-icon-shake-wrapper {
      position: absolute;
      right: px2rem(15);
      top: 0;
      height: px2rem(42);
      @include center;
    }
  }

  .title-icon-back-wrapper {
    position: absolute;
    left: px2rem(15);
    top: 0;
    z-index: 200;
    height: px2rem(42);
    transition: height $animationTime $animationType;
    @include center;

    &.hide-title {
      height: px2rem(52);
    }
  }

  .search-bar-input-wrapper {
    position: absolute;
    left: 0;
    top: px2rem(42);
    display: flex;
    width: 100%;
    height: px2rem(52);
    padding: px2rem(10);
    box-sizing: border-box;
    transition: top $animationTime $animationType;

    &.hide-title {
      top: 0;
    }

    .search-bar-blank {
      flex: 0 0 0;
      width: 0;
      transition: all $animationTime $animationType;

      &.hide-title {
        flex: 0 0 px2rem(31);
        width: px2rem(31);
      }
    }

    .search-bar-input {
      flex: 1;
      width: 100%;
      background: #f4f4f4;
      border-radius: px2rem(20);
      padding: px2rem(5) px2rem(15);
      box-sizing: border-box;
      border: px2rem(1) solid #eee;
      @include left;

      .icon-search {
        color: #999;
      }

      .input {
        width: 100%;
        height: px2rem(22);
        border: none;
        background: transparent;
        margin-left: px2rem(10);
        font-size: px2rem(12);
        color: #666;

        &:focus {
          outline: none;
        }

        &::-webkit-input-placeholder {
          color: #ccc;
        }
      }
    }
  }
}
</style>
