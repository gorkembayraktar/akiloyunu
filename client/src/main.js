import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import store from './store/store'
import firebase from 'firebase/app'

import firebaseConfig from '../firebaseconfig';


Vue.config.productionTip = false


firebase.initializeApp(firebaseConfig);

let app;

firebase.auth().onAuthStateChanged(() => {
  if(!app){
    app = new Vue({
      store,
      vuetify,
      router,
      render: h => h(App)
    }).$mount('#app')
  }
})
