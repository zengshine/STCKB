// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueBus from 'vue-bus'
import store from './store'
import ElementUI from 'element-ui'
import router from './router'
import App from './App'
import commom from '../static/js/commom'
import 'element-ui/lib/theme-default/index.css'
import 'bootstrap/dist/css/bootstrap.css'
import '../static/font-awesome/css/font-awesome.min.css'

Vue.config.productionTip = false;
Vue.config.devtools=true;
Vue.use(ElementUI);
Vue.use(VueBus);
Vue.use(VueRouter,VueAxios,axios,commom);
Vue.prototype.$axios=axios;
Vue.prototype.commom=commom;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
