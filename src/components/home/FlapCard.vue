<template>
  <div class="flap-card-wrapper" v-show="flapCardVisible">
    <div class="flap-card-bg" :class="{'animation': runFlapCardAnimation}" v-show="runFlapCardAnimation">
      <div class="flap-card" v-for="(item, index) in flapCardList" :key="index" :style="{zIndex: item.zIndex}">
        <div class="flap-card-circle">
          <div class="flap-card-semi-circle flap-card-semi-circle-left" :style="semiCircleStyle(item, 'left')"
               ref="left"></div>
          <div class="flap-card-semi-circle flap-card-semi-circle-right" :style="semiCircleStyle(item, 'right')"
               ref="right"></div>
        </div>
      </div>
      <!-- 烟花-->
      <div class="point-wrapper">
        <div class="point" :class="{'animation': runPointAnimation}" v-for="item in pointList" :key="item"></div>
      </div>
    </div>
    <div class="book-card" :class="{'animation': runBookCardAnimation}" v-show="runBookCardAnimation">
      <div class="book-card-wrapper">
        <div class="img-wrapper">
          <img class="img" :src="data ? data.cover : ''">
        </div>
        <div class="content-wrapper">
          <div class="content-title">{{ data ? data.title : '' }}</div>
          <div class="content-author sub-title-medium">{{ data ? data.author : '' }}</div>
          <div class="content-category">{{ categoryText() }}</div>
        </div>
        <div class="read-btn" @click.stop="showBookDetail(data)">{{ $t('home.readNow') }}</div>
      </div>
    </div>

    <div class="close-btn-wrapper" @click="close">
      <div class="icon-close"></div>
    </div>
  </div>
</template>

<script>
import {storeHomeMixin} from "@/utils/mixin";
//引入加载动画的对象,需要在data中声明
import {flapCardList} from "@/utils/store";

export default {
  name: 'FlapCard',
  mixins: [storeHomeMixin],
  data() {
    return {
      flapCardList,
      front: 0,
      back: 1,
      intervalTime: 40,
      runFlapCardAnimation: false, //翻页效果
      pointList: null,
      runPointAnimation: false //烟花效果
    }
  },
  watch: {
    flapCardVisible(v) { //推荐页
      if (v) {
        this.runAnimation()
      }
    }
  },
  methods: {
    close() {
      this.stopAnimation()
      this.setFlapCardVisible(false)
    },
    categoryText() {

    },
    semiCircleStyle(item, dir) {
      return {
        backgroundColor: `rgb(${item.r},${item._g},${item.b}`,
        backgroundSize: item.backgroundSize,
        backgroundImage: dir === 'left' ? item.imgLeft : item.imgRight
      }
    },

    //转动动画。动态执行此函数，每次修改转动角度后调用此函数使图片转动
    // type为front代表 正面的图片转动
    // type为back代表 背面的图片转动
    //正面与背面是不同的图片，正面的图片放在div：right中，背面的图片放在div：left中
    rotate(index, type) {
      const item = this.flapCardList[index]
      let dom = type === 'front' ? this.$refs.right[index] : this.$refs.left[index]

      //deg是单位
      //rotateY：沿y轴转动
      dom.style.transform = `rotateY(${item.rotateDegree}deg)`
      dom.style.backgroundColor = `rgb(${item.r},${item._g},${item.b})`
    },

    startFlapCardAnimation() {
      this.prepare()
      //定时任务
      this.task = setInterval(() => {
        this.flapCardRotate()
      }, this.intervalTime)

      //模拟2.5秒后加载完毕，停止翻页效果
      setTimeout(() => {
        this.stopAnimation()
      }, 2500)
    },

    startPointAnimation() {
      this.runPointAnimation = true
      // 750mm 是因为在flapCard.scss中定义了动画持续750mm
      //750mm之后要让动画消失
      setTimeout(() => {
        this.runPointAnimation = false
      }, 750)
    },

    //初始化背面图片
    //使右边的图片转到正面（right中）图片的背后
    prepare() {
      const backFlapCard = this.flapCardList[this.back]
      backFlapCard.rotateDegree = 180
      backFlapCard._g = backFlapCard.g + 5 * 9
      this.rotate(this.back, 'back')
    },
    //每隔指定时间执行此函数
    flapCardRotate() {
      const frontFlapCard = this.flapCardList[this.front] //正面的元素
      const backFlapCard = this.flapCardList[this.back] //背面的元素

      //正面元素转动
      //视频教学中正面是+10，但是经过自己的测试，只要角度的绝对值相同，视觉效果是一样的
      frontFlapCard.rotateDegree -= 10
      frontFlapCard._g += 5
      //背面元素转动
      backFlapCard.rotateDegree -= 10
      if (backFlapCard.rotateDegree < 90) //由于正面还在转动时看不到背面，所以背面的图片颜色可以不用修改
        backFlapCard._g -= 5

      //当正面转过y轴时，应该设置zIndex，使背面图片覆盖正面从而显示
      //但同时，背面的图片的左右两部分的zIndex在所有图片中最大
      if (frontFlapCard.rotateDegree === -90 && backFlapCard.rotateDegree === 90)
        backFlapCard.zIndex += 2

      this.rotate(this.front, 'front')
      this.rotate(this.back, 'back')

      //重复执行此函数完成一次动画时，迭代下一次
      if (frontFlapCard.rotateDegree === -180 && backFlapCard.rotateDegree === 0)
        this.next()
    },

    next() {
      const frontFlapCard = this.flapCardList[this.front]
      const backFlapCard = this.flapCardList[this.back]
      frontFlapCard.rotateDegree = 0
      backFlapCard.rotateDegree = 0
      frontFlapCard._g = frontFlapCard.g
      backFlapCard._g = backFlapCard.g
      //回归初试位置，否则下一次位置错乱
      this.rotate(this.front, 'front')
      this.rotate(this.back, 'back')

      this.front++
      this.back++
      const len = this.flapCardList.length
      if (this.front >= len)
        this.front = 0
      if (this.back >= len)
        this.back = 0

      // 还原下一次zIndex
      //100=>96 99=>100 98=>99 97=>98 96=>97
      this.flapCardList.forEach((item, index) => {
        item.zIndex = 100 - ((index - this.front + len) % len)
      })
      this.prepare()
    },

    //点击关闭时，停止翻页效果
    stopAnimation() {
      this.runFlapCardAnimation = false
      if (this.task) clearInterval(this.task)
      this.reset()
    },

    //复原翻页动画的初始状态
    reset() {
      this.front = 0
      this.back = 1
      this.flapCardList.forEach((item, index) => {
        item.zIndex = 100 - index
        item._g = item.g
        item.rotateDegree = 0
        this.rotate(index, 'front')
        this.rotate(index, 'back')
      })
    },

    runAnimation() {
      this.runFlapCardAnimation = true
      this.timeout = setTimeout(() => {
        this.startFlapCardAnimation()
        this.startPointAnimation()
      }, 300)
    }
  },
  created() {
    this.pointList = []
    for (let i = 0; i < 18; i++) {
      this.pointList.push(`point${i}`)
    }
  }

}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
@import "../../assets/styles/global";
@import "../../assets/styles/flapCard";

.flap-card-wrapper {
  z-index: 1000;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, .6);
  @include center;
  @include absCenter;

  .flap-card-bg {
    position: relative;
    width: px2rem(64);
    height: px2rem(64);
    border-radius: px2rem(5);
    background: white;
    transform: scale(0);
    opacity: 0;

    &.animation {
      animation: flap-card-move .3s ease-in both; //both 动画主题保留在动画效果的最后状态
    }

    @keyframes flap-card-move {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.2);
        opacity: 1;
      }
      75% {
        transform: scale(.9);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .flap-card {
      width: px2rem(48);
      height: px2rem(48);
      @include absCenter;

      .flap-card-circle {
        display: flex;
        width: 100%;
        height: 100%;

        .flap-card-semi-circle {
          flex: 0 0 50%;
          width: 50%;
          height: 100%;
          background-repeat: no-repeat;
          //当转动到背面时不显示
          //因为转动时，左右各有一张图片，当右边的图片转动到左边时隐藏自身图片的透视，即不能看到自身镜像反转的图案
          backface-visibility: hidden;
        }

        .flap-card-semi-circle-left {
          border-radius: px2rem(24) 0 0 px2rem(24);
          background-position: center right;
          //设置左边图片的转动轴在右边
          transform-origin: right;
        }

        .flap-card-semi-circle-right {
          border-radius: 0 px2rem(24) px2rem(24) 0;
          background-position: center left;
          //设置右边图片的转动轴在左边
          transform-origin: left;
        }
      }
    }

    .point-wrapper {
      z-index: 1500;
      @include absCenter;

      .point {
        border-radius: 50%;
        @include absCenter;

        &.animation {
          //scss for循环，且循环是默认从1开始，生成每个小球自己的样式
          @for $i from 1 to length($moves) {
            &:nth-child(#{$i}) {
              @include move($i);
            }
          }
        }
      }
    }
  }

  .book-card {
    position: relative;
    width: 65%;
    max-width: px2rem(400);
    box-sizing: border-box;
    border-radius: px2rem(15);
    background: white;

    &.animation {
      animation: scale .3s ease-in both;
      @keyframes scale {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    }

    .book-card-wrapper {
      width: 100%;
      height: 100%;
      margin-bottom: px2rem(30);
      @include columnTop;

      .img-wrapper {
        width: 100%;
        margin-top: px2rem(20);
        @include center;

        .img {
          width: px2rem(90);
          height: px2rem(130);
        }
      }

      .content-wrapper {
        padding: 0 px2rem(20);
        margin-top: px2rem(20);

        .content-title {
          color: #333;
          font-weight: bold;
          font-size: px2rem(18);
          line-height: px2rem(20);
          max-height: px2rem(40);
          text-align: center;
          @include ellipsis2(2)
        }

        .content-author {
          margin-top: px2rem(10);
          text-align: center;
        }

        .content-category {
          color: #999;
          font-size: px2rem(14);
          margin-top: px2rem(10);
          text-align: center;
        }
      }

      .read-btn {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 1100;
        width: 100%;
        border-radius: 0 0 px2rem(15) px2rem(15);
        padding: px2rem(15) 0;
        text-align: center;
        color: white;
        font-size: px2rem(14);
        background: $color-blue;
      }
    }
  }

  .close-btn-wrapper {
    position: absolute;
    left: 0;
    bottom: px2rem(30);
    z-index: 1100;
    width: 100%;
    @include center;

    .icon-close {
      width: px2rem(45);
      height: px2rem(45);
      border-radius: 50%;
      background: #333;
      font-size: px2rem(25);
      color: white;
      @include center;
    }
  }
}
</style>
