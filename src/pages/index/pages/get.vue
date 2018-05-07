<template>
    <div>

        <div class="submit-body" v-show="!isShowResult">
            <div class="group group-key">
                <input type="text" v-model="priv_key" placeholder="输入您的私钥"/>
            </div>
            <p class="btn" @click="get">开奖</p>
        </div>

        <div class="result-body" v-show="isShowResult">
            <div v-show="get_value" class="top-div">
                <img src="../images/1.jpg"/>
                <p>恭喜您中奖了！</p>
            </div>
            <p v-show="!get_value" class="top-p">很遗憾！没有中奖！</p>
            <table>
                <tbody>
                <tr>
                    <th width="25%">猜奖号码</th>
                    <th width="25%">押注额度</th>
                    <th width="25%">开奖号码</th>
                    <th width="25%">中奖金额</th>
                </tr>
                <tr>
                    <th>{{guessNumber}}</th>
                    <th>{{value}} NAS</th>
                    <th>{{result}}</th>
                    <th>{{get_value}} NAS</th>
                </tr>
                </tbody>
            </table>
        </div>


        <pool ref="pool"></pool>


        <hint ref="hint"></hint>


        <toast ref="toast"
               class="toast-body"
               :move="isMove"
               :value="isShowDialog"
               :content="toast_content"
               confirm="确认"
               :confirmBack="confirmBack"
        ></toast>

    </div>
</template>


<script>
    import hint from '../../../common/component/hint.vue'
    import toast from '../../../common/component/toast.vue'
    import pool from './pool.vue'
    export default {
        components: {
            hint,
            toast,
            pool,
        },
        data() {
            return {
                priv_key: '',
                // toast
                isMove: false,
                toast_content: '',
                isShowDialog: false,
                account: null,
                address_from: '',
                address_to: 'n1vHJboPxAXSWNgZviRg8oUpThXMPXdpNok',
                isShowResult: false,
                guessNumber: '',
                value: 0,
                result: '',
                get_value: 0,
            }
        },
        methods: {
            set_priv_key (value) {
                this.priv_key = value;
                this.isShowResult = false;
            },
            get() {
                if (!this.priv_key) {
                    this.$refs.hint.show('请填写星云链私钥');
                    return;
                }
                this.getTransactionReceipt();
                this.account = new Account(this.priv_key);
                this.address_from = this.account.getAddressString();
            },
            api() {
                var that = this;
                neb.api.call({
                    chainID: window.chainId,
                    from: this.address_from,
                    to: this.address_to,
                    value: 0,
                    // nonce: this.nonce,
                    gasPrice: 1000000,
                    gasLimit: 2000000,
                    contract: {
                        function: "get_last_all",
                    },
                }).then(function(tx) {
                    console.log(tx);
                    if (tx.execute_err || tx.result == 'false') {
                        that.toast_content = '请先猜奖！'
                        that.$refs.toast.open();
                        return;
                    }
                    var data = JSON.parse(tx.result);
                    if (!data.value) {
                        that.toast_content = '请先猜奖！'
                        that.$refs.toast.open();
                    } else {
                        that.guessNumber = data.guessNumber
                        that.value = parseInt(data.value)/1000000000000000000
                        that.result = data.result
                        that.get_value = data.get_value == '0' ? 0 : parseInt(data.get_value)/1000000000000000000
                        that.isShowResult = true
                    }
                }).catch(function (err) {
                    console.log(err);
                    that.toast_content = '对不起，系统错误'
                    that.$refs.toast.open();
                });
            },
            getTransactionReceipt(isHideToast) {
                var that = this;
                var addr = window.localStorage.getItem('txhash')
                if (!addr) {
                    that.toast_content = '请先猜奖！'
                    that.$refs.toast.open();
                    return;
                }
                neb.api.getTransactionReceipt(addr)
                    .then(function (o) {
                        var step = window.localStorage.getItem('step');
                        if (o.status == 1) {
                            // 更新奖池金额
                            that.$refs.pool.get_amount();
                            if (!step) {
                                if (!isHideToast) {
                                    that.toast_content = '请先猜奖！'
                                    that.$refs.toast.open();
                                }
                                return;
                            } else if (step == '1') {
                                that.sendRawTransaction();
                                if (!isHideToast) {
                                    that.toast_content = '您的交易已经提交，区块链正在打包，大约需要2.5分钟，请耐心等待'
                                    that.$refs.toast.open();
                                }
                            } else if (step == '2') {
                                that.api();
                                window.localStorage.setItem('step', '0');
                            } else if (step == '0') {
                                that.api();
                            }
                        } else if (o.status == 0) {
                            window.localStorage.setItem('step', '0');
                            if (!isHideToast) {
                                that.toast_content = '对不起，交易失败'
                                that.$refs.toast.open();
                            }
                        } else {
                            if (step == '1') {
                                that.toast_content = '您的交易已经提交，区块链正在打包，大约需要5分钟，请耐心等待'
                                setTimeout(function () {
                                    that.getTransactionReceipt(true);
                                }, 60 * 1000)
                            } else if (step == '2') {
                                that.toast_content = '您的交易已经提交，区块链正在打包，大约需要2分钟，请耐心等待'
                            }
                            if (!isHideToast) {
                                that.$refs.toast.open();
                            }
                        }
                    })
                    .catch(function (o) {
                        if (!isHideToast) {
                            that.toast_content = '对不起，交易失败'
                            that.$refs.toast.open();
                        }
                    });
            },
            sendRawTransaction() {
                var that = this;
                neb.api.getAccountState(this.address_from).then(function (resp) {
                    var nonce = parseInt(resp.nonce) + 1;
                    var gTx = new Transaction(
                        window.chainId,
                        that.account,
                        that.address_to,
                        0,
                        nonce,
                        1000000,
                        2000000,
                        {
                            function: "get",
                        },
                    );

                    gTx.signTransaction();

                    neb.api.sendRawTransaction(gTx.toProtoString())
                        .then(function (resp) {
                            console.log(resp);
                            window.localStorage.setItem('txhash', resp.txhash)
                            window.localStorage.setItem('step', '2');
                        })
                        .catch(function (err) {
                            console.log(err);
                            that.toast_content = '对不起，交易失败'
                            that.$refs.toast.open();
                            window.localStorage.setItem('step', '0');
                        });
                })
            },
            confirmBack() {
                this.$refs.toast.close();
            }
        }
    }
</script>

<style lang="less" scoped>

    .submit-body {
        width: 500px;
        border: 1px solid #0696ab;
        padding: 10px;
        margin: 30px auto 50px auto;
        .group {
            input {
                height: 40px;
                width: 100%;
                line-height: 40px;
                padding: 5px 15px;
            }
        }
        .group-key {
            margin-top: 15px;
        }
        .btn {
            width: 120px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            margin: 15px auto 0 auto;
            background: #0696ab;
            color: #fff;
            font-size: 14px;
            cursor: pointer;
            &:hover {
                background: #18a5b4;
            }
        }
    }


    .result-body {
        width: 500px;
        margin: 30px auto 0 auto;
        .top-div {
            img {
                display: block;
                margin: auto;
                width: 80%;
            }
            p {
                font-size: 20px;
                text-align: center;
            }
        }
        .top-p {
            font-size: 20px;
            text-align: center;
        }

    }
    table {
        border-collapse: collapse;
        border-spacing: 0;
        margin-top: 30px;
        font-size: 14px;
        width: 100%;
        .third {
            line-height: 25px;
            text-align: left;

        }
    }
    tbody {
        display: table-row-group;
        vertical-align: middle;
        border-color: inherit;
    }
    tr {
        height: 48px;
    }
    th {
        text-align: center;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
    }

    td {
        padding: 16px 24px;
        box-sizing: border-box;
        text-align: center;
        border: 1px solid #ddd;
    }


</style>


