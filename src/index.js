
import './common/css/base.less';
import Vue from 'vue';





// 公共方法*********************************************
import util from './common/js/util.js';
Vue.use(util);



// vueResource*********************************************
// import vueResource from 'vue-resource';
// Vue.use(vueResource);








// router*************************************************
import VueRouter from 'vue-router';
Vue.use(VueRouter);
// import getRouter from './pages/get/router.js';
// import saveRouter from './pages/save/router.js';
// import ruleRouter from './pages/rule/router.js';
import indexRouter from './pages/index/router.js';
const router = new VueRouter({
    routes:[
        // getRouter,
        // saveRouter,
        // ruleRouter,
        indexRouter,
        {
            path:'*', redirect:'/index/1'
        }
    ],
    // scrollBehavior (to, from, savedPosition) {
    //     return { x: 0, y: 0 }
    // }
});




var app = new Vue({
    router,
}).$mount('#app');






