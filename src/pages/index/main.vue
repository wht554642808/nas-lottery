<template>
    <div class="body-body">
        <p class="header" @click="aaa()">区块链彩票系统（只支持星云链）</p>

        <ul>
            <li :class="[ active == 1 ? 'active' : '']" @click="change(1)">猜奖</li>
            <li :class="[ active == 2 ? 'active' : '']" @click="change(2)">领奖</li>
            <li :class="[ active == 3 ? 'active' : '']" @click="change(3)">规则</li>
            <li :class="[ active == 4 ? 'active' : '']" @click="change(4)" style="letter-spacing: 1px;">联系我</li>
        </ul>




        <save v-show="active == 1" @to_get="to_get"></save>
        <get ref="get" v-show="active == 2" ></get>
        <rule v-show="active == 3" ></rule>
        <contact v-show="active == 4" ></contact>



    </div>
</template>


<script>
    import save from './pages/save.vue'
    import get from './pages/get.vue'
    import rule from './pages/rule.vue'
    import contact from './pages/contact.vue'
    export default {
        components: {
            save,
            get,
            rule,
            contact,
        },
        data() {
            return {
                active: this.$route.params.id,
            }
        },
        methods: {
            change: function (index) {
                this.active = index;
                this.$router.push({path: '/index/' + index});
            },
            to_get: function (value) {
                this.active = 2;
                this.$router.push({path: '/index/' + 2});
                this.$refs.get.set_priv_key(value);
            },
        }
    }
</script>

<style lang="less" scoped>
    .body-body {
        width: 100%;
        max-width: 500px;
        margin: auto;

    }
    .header {
        font-size: 20px;
        text-align: center;
        margin: 20px 0 0 0;
    }
    ul {
        display: flex;
        width: 100%;
        margin: 20px auto 0 auto;
        color: #0696ab;
    }
    li {
        height: 30px;
        line-height: 30px;
        width: 25%;
        text-align: center;
        letter-spacing: 3px;
        cursor: pointer;
        &:hover {
            background: #0696ab;
            color: #fff;
        }
    }
    .active {
        background: #0696ab;
        color: #fff;
    }
</style>


