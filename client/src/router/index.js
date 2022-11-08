import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Game from '../views/Game.vue'
import Main  from '../views/Main.vue'

import HomeMatchs from '../components/Home/Matchs.vue'
import HomeSettings from '../components/Home/Settings.vue'
import HomeFindFriend from '../components/Home/FindFirend.vue'

import * as firebase from 'firebase/app';
import "firebase/auth"


import io from 'socket.io-client';
import VueSocketIO from 'vue-socket.io';



Vue.use(new VueSocketIO({
  connection:io('https://onlinesocket.herokuapp.com'/*'http://localhost:3000'*/,{
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    transports: ['websocket'],
  }) //'http://localhost:3000'
}));


Vue.use(VueRouter)
Vue.use(VueResource)

  const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main,
    meta:{
      requiresAuth:true,
      title:'Application'
    },
    children:[
      {
        path:'',
        name:'matchs',
        component:HomeMatchs,
      },
      {
        path:'/settings',
        name:'settings',
        component:HomeSettings,
      },
      {
        path:'/findfriend',
        name:'findfirend',
        component:HomeFindFriend
      }
    ]
  },
  {
    path: '/hakkimizda',
    name: 'About',

    component: () => import('../views/About.vue')
  },{
    path: '/gizlilik',
    name: 'Privacy',

    component: () => import('../views/Privacy.vue')
  },{
    path: '/nasil-oynanır',
    name: 'Howtoplay',

    component: () => import('../views/Howtoplay.vue')
  },
  {
    path:'/game/:id',
    name:'Oyun alanı',
    component:Game,
    meta:{
      requiresAuth:true
    }
  },
  {
    path:'/login',
    name:'Giriş yap',
    component:Login,
  },
  {
    path:'/register',
    name:'Kayıt ol',
    component:Register
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  document.title = 'Eşini Bul Oyunu'; //to.meta.title
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = await firebase.auth().currentUser;
  console.log(to);
  if(requiresAuth && !isAuthenticated){
    next('/login');
  }else{

    const login = to.matched.some(recor => recor.path == '/login' || recor.path == '/register');
    if(login && isAuthenticated){
      next('/');
    }else if(to.matched.length == 0){
      next('/login');
    }else
      next();
  }

})

export default router
