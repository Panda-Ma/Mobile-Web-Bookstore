<template>
  <div class="store-home">
    <search-bar></search-bar>
    <flap-card :data="random"></flap-card>
    <scroll :top="scrollTop" @onScroll="onScroll" ref="scroll">

      <div>
        <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores consequuntur eius ipsum quaerat! Animi
          doloremque, dolores enim eos eveniet exercitationem explicabo molestias neque optio placeat quasi, quos sint
          vel vero?
        </div>
        <div>At atque autem consequatur dicta dolor doloremque esse eveniet iste iure laborum minima, minus nihil non
          obcaecati odit optio placeat praesentium, provident quis quod rerum saepe sequi veritatis voluptas voluptatem.
        </div>
        <div>Consequatur consequuntur deleniti dolore doloremque dolorum earum enim explicabo laudantium minus neque
          nesciunt officiis omnis, quam reprehenderit ut velit veritatis voluptas voluptate. Accusamus dicta laboriosam
          libero nemo obcaecati quod repellat.
        </div>
        <div>Aliquid at deleniti, dignissimos doloremque eligendi error fugit hic ipsa molestias non provident quas
          quisquam repellat rerum saepe sit tempore temporibus, ut voluptatibus voluptatum! Culpa cumque deleniti
          dolorum eaque et?
        </div>
        <div>Alias incidunt laborum laudantium maiores natus non numquam omnis quasi recusandae ullam. Asperiores
          commodi esse incidunt ipsum iste itaque laudantium modi natus neque porro, quaerat, saepe similique sint
          temporibus vero!
        </div>
        <div>Cupiditate fugiat laudantium nemo repudiandae tempora veritatis voluptatibus? Ad aspernatur blanditiis
          cupiditate eius fuga fugiat in maxime nam officia quo rerum sapiente sed suscipit, vero voluptates. Cupiditate
          facilis itaque provident!
        </div>
        <div>Assumenda beatae deserunt dolores explicabo facere numquam omnis sed! Eveniet fuga labore laudantium?
          Blanditiis commodi culpa ducimus eum eveniet, harum labore numquam odio porro praesentium quas quibusdam
          quisquam sapiente tempore?
        </div>
        <div>A error explicabo in iure laboriosam, praesentium recusandae sit suscipit tempore veritatis! Ad asperiores
          consectetur cum deleniti ducimus eaque enim esse id ipsum, iste iure nostrum, quasi saepe, voluptate
          voluptates!
        </div>
        <div>Adipisci autem commodi iste! Aperiam ea illo laboriosam laborum maiores rerum suscipit? Ad, animi aperiam
          atque autem deserunt dignissimos hic illum ipsam libero molestias mollitia nam placeat, tempore, unde
          voluptatum!
        </div>
        <div>Deleniti iste maiores maxime officiis provident quaerat quo reiciendis suscipit temporibus? Accusantium,
          aliquam, architecto aspernatur consequuntur eligendi exercitationem explicabo impedit in mollitia nobis odit
          quia quis repudiandae similique sunt vero.
        </div>
      </div>

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
import SearchBar from "@/components/home/SearchBar";
import Scroll from "@/components/common/Scroll";

export default {
  name: "StoreHome",
  mixins: [storeHomeMixin],
  data(){
    return {
      scrollTop:94,
    }
  },
  components: {
    SearchBar,
    Scroll,
  },
  methods: {
    //这里接受子组件传递的数据，并保存到vuex
    onScroll(offsetY){
      this.setOffsetY(offsetY)

      if(offsetY>0){
        this.scrollTop=52
      }else{
        this.scrollTop=94
      }
      this.$refs.scroll.refresh()
    },
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