<template>
  <v-app>
      
        
      <Header :drawer="drawer" @drawer="changeDrawer"/>
  
      <!--Friend Drawer-->
       <Friend :drawer="drawer"  
       @matchDialogInviteIntialize="matchDialogInviteIntialize" 
      />


       <v-main>

          <v-container>
            <Home @matchDialog="changeMatchDialog" />
          </v-container>
        </v-main>

        <Footer />
        


        <ModalMatch :matchDialog="matchDialog" @matchDialog="changeMatchDialog" @matchDialogLoader="changeMatchDialogLoader"/>
        <ModalMatchLoader :matchDialogLoader="matchDialogLoader" @matchDialogLoader="changeMatchDialogLoader"/>
        <ModalMatchInvite :matchDialogInvite="matchDialogInvite" @matchDialogInvite="changematchDialogInvite" :user="matchDialogInviteUser" />
        <ModalMatchInviteRequest :matchDialogInviteRequest="matchDialogInviteRequest" @matchDialogInviteRequest="changematchDialogInviteRequest" :info="matchDialogInviteRequestInfo" />
        <ModalMatchHasJoined :user="user" :matchDialogHasJoined="matchDialogHasJoined" @matchDialogHasJoined="changematchDialogHasJoined"  />
        <Modal />

        <Snackbar />

  </v-app>
</template>


<script>

import Header from './parts/Header';
import Footer from './parts/Footer';
import Home from './Home'
import Friend from '@/components/Friend';
import ModalMatch from '@/components/ModalMatch';
import ModalMatchLoader from '@/components/ModalMatchLoader';
import ModalMatchInvite from '@/components/ModalMatchInvite';
import ModalMatchInviteRequest from '@/components/ModalMatchInviteRequest';
import ModalMatchHasJoined from '@/components/ModalMatchHasJoined';
import Modal from '@/components/Modal';
import Snackbar from '@/components/Snackbar';


import * as firebase from 'firebase/app';
import "firebase/auth"

export default {
  name: 'Main',
  components:{
    Home,
    Friend,
    Header,
    Footer,
    ModalMatch,
    ModalMatchLoader,
    ModalMatchInvite,
    ModalMatchInviteRequest,
    ModalMatchHasJoined,
    Modal,
    Snackbar
  },
  data(){
    return {
      drawer:true,
      matchDialog:false,
      matchDialogLoader:false,
      matchDialogInvite:false,
      matchDialogInviteUser:{
        fullname:'',
        avatar:'',
        level:0
      },
      matchDialogInviteRequestInfo:{
        user:{fullname:'',
        avatar:'',
        level:0},
        info:{mode:'',theme:''}
      },
      matchDialogHasJoined:false,
      matchDialogInviteRequest:false,
      interval:null,
      isLogin:false,
      user:{
        id:firebase.auth().currentUser.uid,
        gameID:null
      }
    }
  },
  created(){
    let vm = this ;

    setTimeout(()=>{
      this.$socket.emit('match-status-checking',{id:this.user.id})
    },2500);
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
       vm.isLogin = true;
      } else {
        vm.isLogin = false;
      }
    });
  },
  sockets:{
    ["match-status-checking"](data){
      if(data.isPlaying){
        this.user.gameID = data.gameID;
        this.matchDialogHasJoined = true;
      }
    },
    ["match-invite"](data){
       console.log(data)
       this.matchDialogInviteRequestInfo = data;
       this.matchDialogInviteRequest = true;
    }
    
  },
  methods:{
    changeDrawer(value){
        this.drawer = value;
    },
    changeMatchDialog(value){
      this.matchDialog = value;
    },
    changeMatchDialogLoader(value){
      if(value){
          this.$socket.emit('matching-cancel',{id:this.user.id});
      }
      this.matchDialogLoader = value;
    },
    changematchDialogInvite(value){
      this.matchDialogInvite = value;
    },
    changematchDialogInviteRequest(value){
      this.matchDialogInviteRequest = value;
    },
    matchDialogInviteIntialize(user){
      this.matchDialogInviteUser = user;
      this.matchDialogInvite = true;
    },
    changematchDialogHasJoined(value){
      this.matchDialogHasJoined = value;
    }
  }
};
</script>



<style lang="scss">
body{
    background-color:#18191a;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
