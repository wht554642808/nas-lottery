'use strict';
// 奖池
var Amount = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.amount = new BigNumber(o.amount);
    } else {
        this.amount = new BigNumber(0);
    }
};
Amount.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// form的存储
var FromContent = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.guessNumber = o.guessNumber;
        this.value = new BigNumber(o.value);
        this.result = o.result;
    } else {
        this.guessNumber = '';
        this.result = '';
        this.value = new BigNumber(0);
    }
};
FromContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

// 上一次开奖结果
var LastGetContent = function (text) {
    if (text) {
        var o = JSON.parse(text);
        this.guessNumber = o.guessNumber;
        this.result = o.result;
        this.value = new BigNumber(o.value);
        this.get_value = new BigNumber(o.get_value);
    } else {
        this.guessNumber = '';
        this.result = '';
        this.value = new BigNumber(0);
        this.get_value = new BigNumber(0);
    }
};
LastGetContent.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var LotteryContract = function () {
    LocalContractStorage.defineMapProperty(this, "fromObj", {
        parse: function (text) {
            return new FromContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "lastGet", {
        parse: function (text) {
            return new LastGetContent(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, "amountObj", {
        parse: function (text) {
            return new Amount(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};


LotteryContract.prototype = {
    init: function () {
        //TODO:
    },
    // 猜奖
    save: function (guessNumber) {
        if (!/\d{4}/.test(guessNumber)) {
            return false;
        }

        var value = new BigNumber(Blockchain.transaction.value);
        if (!value) {
            return false;
        }


        // 获取奖池金额
        var amount = value;
        var to = Blockchain.transaction.to;
        var obj = this.amountObj.get(to);
        if (obj) {
            amount = amount.plus(obj.amount);
        }
        // 存储amount数据
        var obj = new Amount();
        obj.amount = amount;
        this.amountObj.put(to, obj);

        // 存储fromObj的数据
        var from = Blockchain.transaction.from;
        var obj = new FromContent();
        obj.guessNumber = guessNumber;
        obj.value = value;
        obj.result = '';
        this.fromObj.put(from, obj);

        // 存储lastGet的数据
        var obj = new LastGetContent();
        obj.guessNumber = '';
        obj.value = 0;
        obj.get_value = 0;
        obj.result = '';
        this.lastGet.put(from, obj);
        return {value: value, amount: amount, guessNumber: guessNumber}
    },
    // 获取当前猜奖信息
    get_now_all: function() {
        var from = Blockchain.transaction.from;
        var obj = this.fromObj.get(from);
        if (obj) {
            return obj;
        } else {
            return false;
        }
    },
    // 获取上一次猜奖结果
    get_last_all: function() {
        var from = Blockchain.transaction.from;
        var obj = this.lastGet.get(from);
        if (obj) {
            return obj;
        } else {
            return false;
        }
    },
    // 获取奖池金额
    get_amount: function() {
        var to = Blockchain.transaction.to;
        var obj = this.amountObj.get(to);
        if (obj) {
            return obj;
        } else {
            return false;
        }
    },
    // 开奖
    get: function() {
        var obj;
        var from = Blockchain.transaction.from;
        obj = this.fromObj.get(from);
        if (!obj || !obj.guessNumber || !obj.value) {
            throw new Error("wrong");
        }
        var to = Blockchain.transaction.to;
        var amount = new BigNumber(this.amountObj.get(to).amount);
        var guessNumber = obj.guessNumber;
        var value = new BigNumber(obj.value);

        var get_value = new BigNumber(0);


        // 猜的数字和结果数字
        var guess = guessNumber.split('');
        if (obj.result) {
            var result = obj.result.split('');
        } else {
            var arr = Blockchain.transaction.hash.split('');
            var result = [];
            for (var i=0; i<arr.length; i++) {
                if (parseInt(arr[i]) > -1) {
                    result.push(arr[i]);
                }
            }
            if (result.length < 4) {
                result.push(0);
                result.push(0);
                result.push(0);
                result.push(0);
            }
            result.length = 4;
        }



        // 开始计算
        var _c = 0;
        if (guess[0] == result[0]) {
            _c++;
        }
        if (guess[1] == result[1]) {
            _c++;
        }
        if (guess[2] == result[2]) {
            _c++;
        }
        switch (_c) {
            case 1: get_value = 2 * value;break;
            case 2: get_value = 5 * value;break;
            case 3: get_value = 50 * value;break;
        }

        if (guess[3] == result[3]) {
            get_value = 2 * get_value;
        }


        // 如果奖池金额不足情况
        if (amount < 0.2 * 1000000000000000000) {
            return false;
        }
        if (get_value > amount.sub(0.1 * 1000000000000000000)) {
            get_value = amount.sub(0.1 * 1000000000000000000);
        }


        // 打币
        if (get_value) {
            var _result = Blockchain.transfer(from, get_value);
            if (!_result) {
                throw new Error("transfer failed.");
            }
            Event.Trigger("BankVault", {
                Transfer: {
                    from: Blockchain.transaction.to,
                    to: from,
                    value: get_value.toString()
                }
            });

            // 存储amount数据
            amount = amount.sub(get_value);
            obj = new Amount();
            obj.amount = amount;
            this.amountObj.put(to, obj);
        }


        // 存储fromObj的数据
        obj = new FromContent();
        obj.guessNumber = '';
        obj.value = 0;
        obj.result = '';
        this.fromObj.put(from, obj);

        // 存储lastGet的数据
        obj = new LastGetContent();
        obj.guessNumber = guessNumber;
        obj.value = value;
        obj.get_value = get_value;
        obj.result = result.join('');
        this.lastGet.put(from, obj);


        return {result: result.join(''),guessNumber:guessNumber, get_value: get_value};
    },
    // 提取金额
    get_all: function(value) {
        var from = Blockchain.transaction.from;
        if (from !== 'n1XuciYNch6JfxY6gzVNFsET4emaxzwoRsd') {
            return false;
        }

        var get_value = new BigNumber(value) * 1000000000000000000;

        var to = Blockchain.transaction.to;
        var amount = new BigNumber(this.amountObj.get(to).amount);


        var _result = Blockchain.transfer(from, get_value);
        if (!_result) {
            throw new Error("transfer failed.");
        }
        Event.Trigger("BankVault", {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: get_value.toString()
            }
        });
        // 存储amount数据
        amount = amount.sub(get_value);
        var obj = new Amount();
        obj.amount = amount;
        this.amountObj.put(to, obj);
        return 'success';
    },
    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        var result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    }
};
module.exports = LotteryContract;
