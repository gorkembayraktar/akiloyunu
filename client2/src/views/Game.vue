<template>
  <v-app>
      
       <v-app-bar app clipped-left class="grey darken-4 white--text">
              
                <v-toolbar-title>
                    <v-btn @click="mainQuestionDialog = true">
                        <v-icon>mdi-home</v-icon>

                    </v-btn>
                </v-toolbar-title>
               
                <v-row class="align-center justify-center mx-md-12">
         
                    <div class="mt-3">
                     
                        <v-responsive
                        class="text-center grey darken-3 d-inline-flex align-center justify-center ma-3 mt-12"
                        height="50"
                        width="100"
                        >
                        <h1>B: {{scorTable.me.score}}</h1>
                        </v-responsive>
                        <v-responsive
                        :class="`${this.userid == this.order ? 'countdown-mine' : 'countdown-her'} text-center rounded-circle d-inline-flex align-center justify-center ma-3 mt-12`"
                        
                        height="100"
                        width="100"
                        >
                        <small>Geri sayım</small>
                        <h1>{{time}}</h1>
                        </v-responsive>
                        <v-responsive
                        class="text-center grey darken-3  d-inline-flex align-center justify-center ma-3 mt-12 scortable"
                        height="50"
                        width="100"
                        >
                        <h1>O: {{scorTable.her.score}}</h1>
                        </v-responsive>
                    </div>
                    
               </v-row>


                <v-app-bar-nav-icon class="white--text" @click="changeDrawer"></v-app-bar-nav-icon>
        </v-app-bar>
        <v-snackbar
          v-model="snackbar"
          color="success"
          timeout="0"
        >
          Oynama sırası sende!

          <template v-slot:action="{ attrs }">
            <v-btn

              text
              v-bind="attrs"
              @click="snackbar = false"
            >
              Kapat
            </v-btn>
          </template>
        </v-snackbar>

        <Chat :drawer="drawer" :opponent="opponent" :user="{id:userid,fullname:scorTable.me.fullname,gameID:gameID}"/>

        <v-main class="main-bg mt-12">
           
          <v-container fluid style="max-width:800px;">
               
            <v-row class="justify-center">
                <v-card 
                dark
                :style="`flex-basis:18%;pointer-events:${card.open ? 'none':'auto'}`"
                :class="`text-center align-center mb-1 mr-1 box-item ${card.open ? 'card-flip':''}`"
                md="3" v-for="card in cards" :key="card.id" @click="change(card)">
                <v-img 
                height="100%"
                :src="imageURL.concat(card.backgroundImage)" v-if="card.open"> </v-img>
                </v-card>
                
               
                
            </v-row>
          </v-container>
        </v-main>

        <ModalMainQuestion @escapeMatch="escapeMatch" :mainQuestionDialog="mainQuestionDialog" @mainQuestionDialog=" changeMainQuestionDialog" />

        <ModalMatchResult :win="win" :matchResult="matchResult" />
 

  </v-app>
</template>


<script>

import Chat from '@/components/Game/Chat'
import ModalMainQuestion from '@/components/Game/ModalMainQuestion'
import ModalMatchResult from '@/components/Game/ModalMatchResult'

import * as firebase from 'firebase/app';
import "firebase/auth"

export default {
  name: 'App',
  components:{
      Chat,
      ModalMainQuestion,
      ModalMatchResult
  },
  data(){
    return {
        snackbar:false,
        matchResult:false,
        win:null,
        imageURL:window.location.origin+'/themes/',
        userid:"",
        gameID:"",
        opponent:{},
        scorTable:{
          me:{
            score:0,
            fullname:''
          },
          her:{
            score:0,
            fullname:''
          }
        },
        temporory:null,
        request:0,
        order:"",
        mainQuestionDialog:false,
        drawer:true,
        cards:Array.from({length:20},(v,i)=>i).map(item=> {
            let obj = {};
            obj.id = item;
            obj.open = false;
            obj.backgroundImage = "";
            obj.pointerEvents = "auto";
            return obj;
        }),
        time:10,
        audio:{
          time:new Audio(this.$store.state.sounds.time),
          timeTicking:new Audio(this.$store.state.sounds.timeTicking),
        },
        interval:null
    }
  },
  created(){
      this.gameID = this.$route.params.id;
      this.userid = firebase.auth().currentUser.uid;
      this.$socket.emit('matching-gameid-control',{gameid:this.gameID,id:this.userid})
  },
  sockets:{
    ["matcing-gameid-control"](control){
      /*Eğer oyuncu değilse Erişilemezdir. */
      if(control.state == false)
        this.$router.push('/');
    },
    ["game started"](data){
      this.order = data.order;
      this.opponent = data.users[Object.keys(data.users).filter(userid => userid != this.userid)];
      this.scorTable.her.score = this.opponent.score;
      this.scorTable.her.fullname = this.opponent.fullname;
      this.scorTable.me.score = data.users[this.userid].score;
      this.scorTable.me.fullname = data.users[this.userid].fullname;
      console.log(data);
    },
    ["game timer"](data){
      this.time = data.second;
      if(this.order == this.userid) 
        data.second > 3 ? this.audio.time.play() : this.audio.timeTicking.play()
      
    },
    ["game card turn"](data){
       if(data.error){
         console.log(data);
         return;
       }
       this.cards[data.cardId].open = true;
       this.cards[data.cardId].backgroundImage = data.card.img;
       console.log(data,this.imageURL.concat(data.card.img));
    },
    ["game card turnchange"](data){
      this.order = data.order;
      if(data.order == this.userid){
        this.snackbar = true;

        this.request = 0;
      }else{
        setTimeout(()=>{this.snackbar = false},500);
      } 
    },
    ["game card result"](data){
      if(data.state == false){
        setTimeout(()=>{

          data.ids.forEach(id => {
            this.cards[id].open = false;
          });
        },3000);
      }else{
          this.scorTable.her.score = data.users[this.opponent.id].score;
          this.scorTable.me.score = data.users[this.userid].score;

          //Object.keys(data.users).forEach(USER => this.scorTable[USER].score = data.users[USER].score )
      }
    },
    ["game over"](data){
      this.win = data.winner.id == this.userid;
      this.matchResult = true; 
    },
    ["user leave"](){
      console.log('KULLANICI ODADAN AYRILDI');
      this.$router.push('/');
      this.$store.commit('mainModalOpen',{
          title:'Rakip oyundan ayrıldı.',
          content:'Kullanıcı oyundan ayrıldığı için oyun sona erdi.',
          icon:''
      });
    }
  },
  methods:{
    changeDrawer(){
        this.drawer = !this.drawer;
    },
    change(card){
      if(this.order != this.userid) return;
      
      this.request = this.request + 1;
      if(this.request == 2) return;
      
      console.log(card);
      this.$socket.emit('game card turn',{user:{id:this.userid},cardId:card.id})
    },
    changeMainQuestionDialog(value){
        this.mainQuestionDialog = value;
    },
    escapeMatch(){
          this.$socket.emit('user leave',{gameID:this.gameID})
          clearInterval(this.interval);
          this.$router.push('/');
    }
  },
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

.card-flip{
    animation-name:flip;
    animation-iteration-count: 1;
    animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
    animation-duration: 3s;
    animation-fill-mode: backwards;
    animation-direction: alternate;
}

.countdown-mine{
  background-color: rgb(33, 86, 0);
}
.countdown-her{
  background-color: rgb(40, 113, 119);
}

@keyframes flip {
    100%{ transform:rotateY(0)}
    50%{transform:rotateY(180deg)}
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
.scrollable {
    overflow-y: auto;
    height: 70vh;
}
.scortable{
  position:relative;
}
.scortable .username{
  position:absolute;
  bottom:-20px;
  background-color:black;
  z-index:99;
}
span.scor{
  box-sizing: border-box;
  border-radius:50%;
  height:50px;width:50px;
  text-align:center;
  line-height: 50px;
  font-size:30px;
}
.box-item{
  width:150px;
  height:150px;
}
@media only screen and (max-width: 760px) {
  .box-item{
      width:100px;
      height:100px;
  }
}
@media only screen and (max-width: 500px) {
  .box-item{
      width:80px;
      height:80px;
  }
}
</style>
