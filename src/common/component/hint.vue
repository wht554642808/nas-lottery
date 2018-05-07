<template>
  <div v-if="isShow">
    <p>{{words}}</p>
  </div>

</template>
<script>
  export default{
    data(){
      return{
        isShow: false,
        words: ''
      }
    },
    methods: {
      show(words, timeout) {
        if (this.isShow) {
          return;
        }
        this.words = words;
        this.isShow = true;
        var that = this;
        setTimeout(function () {
          that.isShow = false;
        }, timeout || 5000)
      }
    }
  }
</script>


<style lang="scss" scoped>
  div {
    position: fixed;
    top: 0;
    bottom:0;
    left: 0;
    right: 0;
    margin: auto;
    width: 1000px;
    height: 70px;
    z-index: 999;
    text-align: center;
  }
  p {
    display: inline-block;
    padding: 16px 30px;
    color: #fff;
    border-radius: 5px;
    font-size: 14px;
    background-color: transparentize(#000, .2);
    text-align: center;
    max-width: 600px;
  }
</style>
