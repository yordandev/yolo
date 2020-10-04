import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import GAuth from 'vue-google-oauth2'

const gauthOption = {
	clientId: '974845574224-ck6jtidv4ftch9t7kqt5stt8b9bub0h8.apps.googleusercontent.com',
	scope: 'profile email',
	prompt: 'consent',
}

Vue.config.productionTip = false

Vue.use(Antd)
Vue.use(GAuth, gauthOption)

new Vue({
	router,
	render: (h) => h(App),
}).$mount('#app')
