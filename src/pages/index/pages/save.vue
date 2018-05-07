<template>
    <div>
        <ul class="header-top">
            <li>百位</li>
            <li>十位</li>
            <li>个位</li>
            <li class="last">特殊位</li>
        </ul>

        <div class="select-number-container" id="J_SelectNumberContainer">
            <ul>
                <li :class="[active_bai == i ? 'active' : '' ]" @click="active_bai = i" v-for="i in [0,1,2,3,4,5,6,7,8,9]">{{i}}</li>
            </ul>
            <ul>
                <li :class="[active_shi == i ? 'active' : '' ]" @click="active_shi = i" v-for="i in [0,1,2,3,4,5,6,7,8,9]">{{i}}</li>
            </ul>
            <ul>
                <li :class="[active_ge == i ? 'active' : '' ]" @click="active_ge = i" v-for="i in [0,1,2,3,4,5,6,7,8,9]">{{i}}</li>
            </ul>
            <ul class="last">
                <li :class="[active_num == i ? 'active' : '' ]" @click="active_num = i" v-for="i in [0,1,2,3,4,5,6,7,8,9]">{{i}}</li>
            </ul>
        </div>

        <div class="submit-body">
            <div class="group group-value">
                <input type="text" v-model="value" placeholder="输入金额"/>
                <p>NAS</p>
            </div>
            <div class="group group-key">
                <input type="text" v-model="priv_key" placeholder="输入您的私钥"/>
            </div>

            <p class="btn" @click="submit">提交</p>
        </div>

        <pool></pool>

        <hint ref="hint"></hint>

        <toast ref="toast"
               class="toast-body"
               :move="isMove"
               :value="isShowDialog"
               :content="toast_content"
               confirm="确认"
               :confirmBack="confirmBack"
        ></toast>


        <toast ref="toast_guide"
               class="toast-body"
               :move="isMove"
               :value="isShowDialog"
               content="第一步选择四个号码（不了解规则可点击 <a href='index.html#/index/3'> 查看规则 </a> ）;第二步填入您要押注的金额（即多少个NAS）;第三步在输入框中填入您的私钥（我们不会保存您的私钥，如果不放心可以拿少量NAS的账户玩），然后点击提交，页面就会跳转到开奖页面。点击开奖按钮即可查看自己有没有中奖。如果中奖不需要您任何操作，系统自动会将中奖金额发到您的NAS地址账号中。"
               title="教您如何玩"
               confirm="确认"
               :confirmBack="confirmBackGuide"
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
                active_bai: -1,
                active_shi: -1,
                active_ge: -1,
                active_num: -1,
                value: '',
                value_big: '',
                priv_key: '',
                account: null,
                address_from: '',
                address_to: 'n1vHJboPxAXSWNgZviRg8oUpThXMPXdpNok',
                contract: {
                    function: "save",
                    args: ''
                },
                nonce: 0,
                // toast
                isMove: false,
                toast_content: '',
                isShowDialog: false,
                isRight: false,
            }
        },
        mounted() {
            var that = this;
            setTimeout(function () {
                if (!window.localStorage.getItem('isShowGuide')) {
                    that.$refs.toast_guide.open();
                }
            }, 500)

        },
        methods: {
            submit: function () {
                var step = window.localStorage.getItem('step');
                if (step && step != '0') {
                    this.toast_content = '对不起，您刚猜奖完，还没开奖，请先开奖！'
                    this.$refs.toast.open();
                    return;
                }

                if (this.active_bai == -1 || this.active_shi == -1 || this.active_ge == -1 || this.active_num == -1) {
                    this.$refs.hint.show('请选择号码');
                    return;
                }
                if (!this.value) {
                    this.$refs.hint.show('请填写押注金额');
                    return;
                }
                if (!this.priv_key) {
                    this.$refs.hint.show('请填写星云链私钥');
                    return;
                }



                this.value_big = nebulas.Unit.toBasic(Utils.toBigNumber(this.value), "nas");
                this.contract.args = '["' + this.active_bai + this.active_shi + this.active_ge + this.active_num + '"]';
                this.account = new Account(this.priv_key);
                this.address_from = this.account.getAddressString();

                var that = this;
                neb.api.getAccountState(this.address_from).then(function (resp) {
                    that.nonce = parseInt(resp.nonce) + 1;
                    that.api();
                })
            },
            api() {
                var that = this;
                neb.api.call({
                    chainID: window.chainId,
                    from: this.address_from,
                    to: this.address_to,
                    value: this.value_big,
                    nonce: this.nonce,
                    gasPrice: 1000000,
                    gasLimit: 2000000,
                    contract: this.contract,
                }).then(function(tx) {
                    console.log(tx);
                    if (tx.execute_err) {
                        that.toast_content = tx.execute_err
                        that.$refs.toast.open();
                    } else {
                        that.isRight = true;
                        that.toast_content = '确定发送该笔交易'
                        that.$refs.toast.open();
                    }
                }).catch(function (err) {
                    console.log(err);
                    that.isRight = false;
                    that.toast_content = '对不起，交易失败'
                    that.$refs.toast.open();
                });
            },
            sendRawTransaction() {
                var gTx = new Transaction(
                    window.chainId,
                    this.account,
                    this.address_to,
                    this.value_big,
                    this.nonce,
                    1000000,
                    2000000,
                    this.contract,
                );

                gTx.signTransaction();

                // alert(gTx.toString());

                var that = this;
                neb.api
                    .sendRawTransaction(gTx.toProtoString())
                    .then(function (resp) {
                        console.log(resp);
                        window.localStorage.setItem('txhash', resp.txhash)
                        window.localStorage.setItem('step', '1')
                        that.$emit('to_get', that.priv_key);
                    })
                    .catch(function (err) {
                        console.log(err);
                        that.toast_content = '对不起，交易失败'
                        that.$refs.toast.open();
                    });
            },
            confirmBack() {
                this.$refs.toast.close();
                if (this.isRight) {
                    this.isRight = false;
                    this.sendRawTransaction();
                }
            },
            confirmBackGuide () {
                this.$refs.toast_guide.close();
                window.localStorage.setItem('isShowGuide', 'true');
            },
        }
    }
</script>

<style lang="less" scoped>
    .header-top {
        margin: 30px auto 0 auto;
        display: flex;
        flex-direction: row;
        width: 452px;
        li {
            width: 100px;
            text-align: center;
        }
        .last {
            width: 150px;
        }

    }

    .select-number-container {
        display: flex;
        margin: 20px auto 0 auto;
        width: 452px;
        ul {
            width: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .last {
            border-left: 1px solid #ccc;
            width: 150px;
            flex: 0 0 auto;
        }
        li {
            flex: 1 1 auto;
            width: 30px;
            height: 30px;
            border-radius: 50px;
            border: 1px solid #aaa;
            text-align: center;
            line-height: 28px;
            margin-bottom: 10px;
            cursor: pointer;
        }
        .active {
            background: #0696ab;
            color: #fff;
        }
    }


    .submit-body {
        width: 500px;
        border: 1px solid #0696ab;
        padding: 10px;
        margin: 30px auto 0 auto;
        .group {
            input {
                height: 40px;
                width: 100%;
                line-height: 40px;
                padding: 5px 15px;
            }
        }
        .group-value {
            overflow: hidden;
            input {
                width: 200px;
                float: left;
            }
            p {
                float: left;
                margin-left: 10px;
                line-height: 40px;
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


</style>



