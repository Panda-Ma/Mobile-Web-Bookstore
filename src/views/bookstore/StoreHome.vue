<template>
  <div class="store-home">
    <search-bar></search-bar>
    <flap-card :data="random"></flap-card>
    <scroll :top="scrollTop" @onScroll="onScroll" ref="scroll">
      <div class="banner-wrapper">
        <div class="banner-img" :style="{backgroundImage:`url('${banner}')`}"></div>
      </div>
      <guess-you-like :data="guessYouLike"></guess-you-like>
      <recommend :data="recommend" class="recommend"></recommend>
      <featured :data="featured" :titleText="$t('home.featured')" :btnText="$t('home.seeAll')"
                class="featured"></featured>
      <div class="category-list-wrapper" v-for="(item, index) in categoryList" :key="index">
        <category-book :data="item"></category-book>
      </div>
      <category class="categories" :data="categories"></category>
    </scroll>
  </div>
</template>

<script>
import {storeHomeMixin} from "@/utils/mixin";
import {home} from "@/api/store";

import SearchBar from "@/components/home/SearchBar";
import Scroll from "@/components/common/Scroll";
import FlapCard from '@/components/home/FlapCard'
import GuessYouLike from '@/components/home/GuessYouLike'
import Recommend from "@/components/home/Recommend";
import Featured from "@/components/home/Featured";
import CategoryBook from "@/components/home/CategoryBook";
import Category from "@/components/home/Category";
import {categories} from "@/mock/bookHome";



export default {
  name: "StoreHome",
  mixins: [storeHomeMixin],
  data() {
    return {
      scrollTop: 94,
      categories: null,
      categoryList: null,
      random: null,
      banner:null,
      guessYouLike:null,
      recommend:null,
      featured:null
    }
  },
  components: {
    SearchBar,
    Scroll,
    FlapCard,
    GuessYouLike,
    Recommend,
    Featured,
    CategoryBook,
    Category,
  },
  methods: {
    //这里接受子组件传递的数据，并保存到vuex
    onScroll(offsetY) {
      this.setOffsetY(offsetY)

      if (offsetY > 0) {
        this.scrollTop = 52
      } else {
        this.scrollTop = 94
      }
      this.$refs.scroll.refresh()
    },
  },
  mounted() {
    //利用axios异步请求mockjs中的数据
    home().then((resp) => {
      if (resp && resp.status === 200) {
        const data = resp.data
        const randomIndex = Math.floor(Math.random()) * data.random.length
        this.random = data.random[randomIndex]
        this.banner=data.banner
        this.guessYouLike=data.guessYouLike
        this.featured=data.featured
        this.recommend=data.recommend
        this.categories=data.categories
        this.categoryList=data.categoryList
      }
    })
  }
}
</script>


<style lang="scss" rel="stylesheet/scss" scoped>
@import "~@/assets/styles/global";

.store-home {
  width: 100%;
  height: 100%;

  .banner-wrapper {
    width: 100%;
    padding: px2rem(10);
    box-sizing: border-box;

    .banner-img {
      width: 100%;
      height: px2rem(150);
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
  }

  .recommend {
    margin-top: px2rem(20);
  }

  .featured {
    margin-top: px2rem(20);
  }

  .category-list-wrapper {
    margin-top: px2rem(20);
  }

  .categories {
    margin-top: px2rem(20);
  }
}
</style>