<template>
  <transition name="slide-up">
    <div class="setting-wrapper" v-show="menuVisible && settingVisible === 2">
      <div class="setting-progress">
        <div class="read-time-wrapper">
          <span class="read-time-text">{{ getReadTimeText() }}</span>
          <span class="icon-forward"></span>
        </div>
        <div class="progress-wrapper">
          <div class="progress-icon-wrapper" @click="prevSection()">
            <span class="icon-back"></span>
          </div>
          <input class="progress" type="range"
                 max="100"
                 min="0"
                 step="1"
                 @change="onProgressChange($event.target.value)"
                 @input="onProgressInput($event.target.value)"
                 :value="progress"
                 :disabled="!bookAvailable"
                 ref="progress">
          <div class="progress-icon-wrapper" @click="nextSection()">
            <span class="icon-forward"></span>
          </div>
        </div>
        <div class="text-wrapper">
          <span class="progress-section-text">{{ this.getSectionName }}</span>
          <span>({{ bookAvailable ? progress + '%' : '加载中...' }})</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {ebookMixin} from "@/utils/mixin";


export default {
  name: "EBookSettingProgress",
  mixins: [ebookMixin],
  methods: {

    prevSection() {
      //章节大于0且书籍加载完毕
      if (this.section > 0 && this.bookAvailable) {
        this.setSection(this.section - 1).then(() => {
          this.displaySection()
        })
      }
    },
    nextSection() {
      //spine.length表示有多少个章节
      if (this.section < this.currentBook.spine.length - 1 && this.bookAvailable) {
        this.setSection(this.section + 1).then(() => {
          this.displaySection()
        })
      }
    },
    //点击上一章或者下一章时显示章节内容
    displaySection() {
      const sectionInfo = this.currentBook.section(this.section)
      if (sectionInfo && sectionInfo.href) {
        this.display(sectionInfo.href)
      }
    },
    //点击进度条，文章发生改变
    onProgressChange(progress) {
      //先修改vuex中的进度，方便回调时epubjs跳转到对应页
      this.setProgress(progress).then(() => {
        // console.log('触发');
        this.displayProgress()
        this.updateProgressBg()
      })
    },
    //滑动进度条百分比保存到vuex
    //松开进度条后会触发一次@change事件，所以displayProgress不用频繁调用
    onProgressInput(progress) {
      //this.setProgress(progress)：松开才会改变，如果要实时渲染，应该添加then中的displayProgress
      this.setProgress(progress).then(() => {
        this.updateProgressBg(progress) //css样式backgroundSize实时渲染，否则停止移动才会更改
      })
    },
    //文章跳转到指定进度
    displayProgress() {
      const cfi = this.currentBook.locations.cfiFromPercentage(this.progress / 100)
      this.display(cfi)
    },
    updateProgressBg() {
      this.$refs.progress.style.backgroundSize = `${this.progress}% 100%`
    },

  },
  updated() {
    this.updateProgressBg()//进度条的背景颜色初始化
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

  .setting-progress {
    position: relative;
    width: 100%;
    height: 100%;

    .read-time-wrapper {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: px2rem(40);
      font-size: px2rem(12);
      @include center;
    }

    .progress-wrapper {
      width: 100%;
      height: 100%;
      @include center;
      padding: 0 px2rem(15);
      box-sizing: border-box;

      .progress-icon-wrapper {
        font-size: px2rem(20);
      }

      .progress {
        width: 100%;
        -webkit-appearance: none;
        height: px2rem(2);
        margin: 0 px2rem(10);

        &:focus {
          outline: none;
        }

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: px2rem(20);
          width: px2rem(20);
          border-radius: 50%;
          background: white;
          box-shadow: 0 4px 4px 0 rgba(0, 0, 0, .15);
          border: px2rem(1) solid #ddd;
        }
      }
    }

    .text-wrapper {
      position: absolute;
      left: 0;
      bottom: px2rem(10);
      width: 100%;
      color: #333;
      font-size: px2rem(12);
      padding: 0 px2rem(15);
      box-sizing: border-box;
      @include center;

      .progress-section-text {
        @include ellipsis;
      }
    }
  }
}
</style>