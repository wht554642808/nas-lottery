<template>
    <div class="body">当前奖池共有{{amount}} 个NAS</div>
</template>
<script>
    export default {
        data() {
            return {
                amount: ''
            }
        },
        mounted() {
            this.get_amount();
        },
        methods: {
            get_amount() {
                var that = this;
                neb.api.call({
                    chainID: window.chainId,
                    from: 'n1XuciYNch6JfxY6gzVNFsET4emaxzwoRsd',
                    to: 'n1vHJboPxAXSWNgZviRg8oUpThXMPXdpNok',
                    value: 0,
                    // nonce: this.nonce,
                    gasPrice: 1000000,
                    gasLimit: 2000000,
                    contract: {
                        function: "get_amount",
                    },
                }).then(function(tx) {
                    console.log(tx);
                    if (tx.result == 'false') {
                        that.amount = 0;
                    } else {
                        var data = JSON.parse(tx.result)
                        that.amount = data.amount == '0' ? 0 : parseInt(data.amount)/1000000000000000000
                    }
                }).catch(function (err) {
                    console.log(err);
                    alert('获取奖池金额失败，请刷新！');
                });
            }
        }
    }
</script>
<style lang="less" scoped>
    div {
        text-align: center;
        margin: 20px 0 30px 0;
    }



</style>


