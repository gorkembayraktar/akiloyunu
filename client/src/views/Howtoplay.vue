<template>
  <v-app>
      
        
      <Header :drawer="drawer" @drawer="changeDrawer"/>
  
      <!--Friend Drawer-->
       <Friend :drawer="drawer" />


       <v-main>

          <v-container class="text-light">
              <div class="home">

                <v-card class="px-5 py-5">
                 Nasıl Oynanır ? 
                </v-card>
                <v-card class="px-5 py-5">
                 Anasayfa'da bulunan KARŞILAŞMA ARA butonu ile "Oyun teması","Oyun Modu" ayarları seçilerek karşılaşma aranır.<v-divider></v-divider>
                 Diğer oyuncularla karşılaşma bulunması halinde 16 Kartlık bir pencereye dahil eder.<v-divider></v-divider>
                 Oyun modundan seçilen zamana göre (5,10,20 sn) aralıklarla hamle sırası kendi aralarında değişir.<v-divider></v-divider>
                 5 Puana ilk ulaşan oyuncu, oyunun galibi olur ve hanesine puan kazanır.<v-divider></v-divider>
                Puanların birikmesiyle level atlayan oyuncu başarı kazanır.
                </v-card>
              
              </div>
          </v-container>
        </v-main>

        <Footer />
        


        <ModalMatch :matchDialog="matchDialog" @matchDialog="changeMatchDialog" @matchDialogLoader="changeMatchDialogLoader"/>
        <ModalMatchLoader :matchDialogLoader="matchDialogLoader" @matchDialogLoader="changeMatchDialogLoader"/>
        <ModalMatchInvite :matchDialogInvite="matchDialogInvite" @matchDialogInvite="changematchDialogInvite" />
        <ModalMatchHasJoined :user="user" :matchDialogHasJoined="matchDialogHasJoined" @matchDialogHasJoined="changematchDialogHasJoined"  />
        <Modal />

  </v-app>
</template>


<script>

import Header from './parts/Header';
import Footer from './parts/Footer';
import Friend from '@/components/Friend';
import ModalMatch from '@/components/ModalMatch';
import ModalMatchLoader from '@/components/ModalMatchLoader';
import ModalMatchInvite from '@/components/ModalMatchInvite';
import ModalMatchHasJoined from '@/components/ModalMatchHasJoined';
import Modal from '@/components/Modal';


import * as firebase from 'firebase/app';
import "firebase/auth"

export default {
  name: 'Main',
  components:{
    Friend,
    Header,
    Footer,
    ModalMatch,
    ModalMatchLoader,
    ModalMatchInvite,
    ModalMatchHasJoined,
    Modal
  },
  data(){
    return {
      drawer:true,
      matchDialog:false,
      matchDialogLoader:false,
      matchDialogInvite:false,
      matchDialogHasJoined:false,
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
    changematchDialogHasJoined(value){
      this.matchDialogHasJoined = value;
    }
  }
};
</script>


