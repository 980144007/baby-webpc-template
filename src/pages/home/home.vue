
<script>

export default {
    name: "page-home",
    // components: {
    //     "baby-scroll": scroll
    // },
    data() {
        return {
            max: 60
        }
    },
    computed: {
        list() {
                const list = [];
                for (let i = 0; i < this.max; i++) {
                    list.push(i);
                }
                return list;
            },
    },
    created() {
        console.log(this.$store)
        // setInterval(() => {
        //     this.max += 10;
        // }, 5000)
    }
}
</script>

<template>
    <div class="page-home-container">
        <el-button type="success">Success</el-button>
        <el-button type="info">Info</el-button>
    </div>
</template>

<style lang="less" scoped>
.page-home-container {
    width: 100%;
    height: 100%;
    background: @background-gray-color;
}    
</style>