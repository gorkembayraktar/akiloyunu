<template>
  <div class="home">

      <v-card class="px-5 py-5">
              
              <v-row>
                 <v-avatar color="blue mr-1 text-xs-center" size="100">
                  <v-img 
                  :src="UserAvatar" />
                </v-avatar>
                <v-col md="4" sm="10" cols="12">
                  <div class="body">{{UserFullName}}

                    <v-btn class="red--text" small @click="logout">
                      Çıkış yap
                      <v-icon>mdi-lgout</v-icon>
                    </v-btn>
                  </div>
                  <div class="caption">{{UserJoinDate}}</div>
                   <v-progress-linear
              
                    background-opacity="0.3"
                    buffer-value="100"
                    height="26"
                    :value="UserXpPercent"
                    color="light-green"
                    class="black--text"
                  >{{UserXpString}}</v-progress-linear>
                </v-col>
                <v-spacer/>
                <v-col class="text-center success--text">
                  <span>Galibiyet</span>
                  <h1>{{UserVictoryCount}}</h1>
                </v-col>
                <v-col class="text-center red--text">
                  Yenilgi
                  <h1>{{UserDefeatCount}}</h1>
                </v-col>
                <v-col class="text-center info--text">
                  Oran
                  <h1>{{UserAchievementPercent}}%</h1>
                </v-col>
                <v-col>
                  <div class="text-center">
                    <v-progress-circular
                      rotate="270"
                      size="84"
                      :value="UserXpPercent"
                      width="10"
                      color="light-blue"
                    >{{UserLevel}} lvl</v-progress-circular>
                  </div>
                </v-col>
              </v-row>
            </v-card>

            <v-row class="my-2 mx-2">
              <v-btn
                    color="info "
                    dark
                    small
                    depressed
                    class="mr-5"
                    text
                    to="/"
                    link
                  >
                    <v-icon small dark>mdi-home</v-icon>
                    Anasayfa
                  </v-btn>
              <v-btn
                    color="info"
                    dark
                    small
                    depressed
                    text
                    to="/settings"
                    link
                  >
                    <v-icon small dark>mdi-cog</v-icon>
                    Profili düzenle
                  </v-btn>
              <v-spacer/>
                    <v-btn
                    color="info mx-5"
                    dark
                    small
                    depressed
                    text
                    to="/findfriend"
                    link
                  >
                    Arkadaş bul
                  </v-btn>
              
                  <v-btn
                    color="info"
                    dark
                    small
                    depressed
                    @click="openMatchDialog"
                  >
                    <v-icon small dark>mdi-sword-cross</v-icon>
                    Karşılaşma ara
                  </v-btn>
             

            </v-row>

            <router-view></router-view>


            

           
    
  </div>
</template>

<script>
import * as firebase from 'firebase/app';
import "firebase/auth"
import { mapActions, mapGetters } from 'vuex'


export default {
  name: 'Home',
  props:[],
  data(){
    return {
    }
  },
  computed:{
    ...mapGetters([
      'UserAvatar',
      'UserFullName',
      'UserJoinDate',
      'UserLevel',
      'UserXpString',
      'UserXpPercent',
      'UserVictoryCount',
      'UserDefeatCount',
      'UserAchievementPercent',
    ])
  },
  methods:{
     ...mapActions([
      'GetDateTurkishFormat'
    ]),
    openMatchDialog() {
     
      this.$emit('matchDialog',true);
    },
    async TurkishUserJoinDate(){
     return this.UserJoinDate;
    },
    async logout(){
        try{
          await firebase.auth().signOut();
          this.$router.push('/login');
        }
        catch(err){
          console.log(err)
        }
    }
  }

}
</script>
