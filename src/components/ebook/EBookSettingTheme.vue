<template>
  <transition name="slide-up">
    <div class="setting-wrapper" v-show="menuVisible && settingVisible === 1">
      <div class="setting-theme">
        <div class="setting-theme-item" v-for="(item, index) in themeList" :key="index" @click="setTheme(index)">
          <div class="preview" :class="{'selected': item.name === defaultTheme}"
               :style="{background: item.style.body.background}"></div>
          <div class="text" :class="{'selected': item.name === defaultTheme}">{{item.alias}}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {ebookMixin} from "@/utils/mixin";
import {saveTheme} from "@/utils/localStorage";

export default {
  name: "EBookSettingTheme",
  mixins:[ebookMixin],
  methods:{
    //点击切换主题
    setTheme(index){
      //根据索引从mixins 获取主题
      const theme=this.themeList[index]
      //修改vuex中的默认主题
      this.setDefaultTheme(theme.name).then(()=>{
        //异步操作之后使阅读背景的主题生效
        this.currentBook.rendition.themes.select(this.defaultTheme)
        //同时修改阅读器控制面板的主题
        this.initGlobalStyle()
      })
      //保存到local Storage中。每本书都可以有一个主题，所以需要传入书名
      saveTheme(this.fileName,theme.name)
    },
  }
}
</script>


<style lang="scss" rel="stylesheet/scss" scoped>
@import "~@/assets/styles/global";

.setting-wrapper {
  position: absolute;
  bottom: px2rem(48);
  left: 0;
  z-index: 160;
  width: 100%;
  height: px2rem(90);
  background: white;
  box-shadow: 0 px2rem(-8) px2rem(8) rgba(0, 0, 0, .15);
  .setting-theme {
    height: 100%;
    display: flex;
    .setting-theme-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: px2rem(5);
      box-sizing: border-box;
      .preview {
        flex: 1;
        border: px2rem(1) solid #ccc;
        box-sizing: border-box;
        &.selected {
          box-shadow: 0 px2rem(4) px2rem(6) 0 rgba(0, 0, 0, .1);
        }
      }
      .text {
        flex: 0 0 px2rem(20);
        font-size: px2rem(14);
        color: #ccc;
        @include center;
        &.selected {
          color: #333;
        }
      }
    }
  }
}
</style>