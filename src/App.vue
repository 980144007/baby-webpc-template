<script setup>

</script>
<script>
  export default {
    data() {
      return {
        clickNum: 0,
        clickTimer: null
      }
    },
    methods: {
      
    },
    created() {
      // console.log(this.cloneDeep)
    }
  }
</script>
<template>
  <div id="app-container" >
    <router-view></router-view>
  </div>
</template>

<style lang="less">
html,body,#app,#app-container {
  width: 100%;
  height: 100%;
  padding: 0px;
  margin: 0px;
  box-sizing: border-box;
}
</style>
