<template>

<v-navigation-drawer app dark right v-bind:value="drawer">
        <v-list>
          <v-row class="ma-2 mb-5">
            <v-toolbar-title class="text-center">
            <v-icon class="mx-4" large>mdi-account-multiple</v-icon>
              <span class="title">Arkadaş Listesi</span>
            </v-toolbar-title>
          </v-row>
           <v-divider />
           
          
      
          <v-list-item class="p-5" dense flat tile  v-for="pendingInvitaion in UserFriendsPending" :key="pendingInvitaion.id">

             <v-avatar color="blue mr-1" size="40">
              <img
                :src="pendingInvitaion.avatar"
                alt="John"
              >
            </v-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{pendingInvitaion.fullname}}
              </v-list-item-title>
              
            </v-list-item-content>
            <v-list-item-action>
              <v-row>
                <v-btn class="mr-2" fab dark x-small color="success" @click="friendAccept(pendingInvitaion)">
                    <v-icon  dark>mdi-check</v-icon>
                </v-btn>
                <v-btn class="" fab dark x-small color="error" @click="friendRefuse(pendingInvitaion)">
                    <v-icon dark>mdi-minus</v-icon>
                </v-btn>
              </v-row>
            </v-list-item-action>

          </v-list-item>

          <v-divider class="my-5"/>
          <span class="body-2 pl-5" v-if="UserFriends.length > 0">{{UserFriends.length}} arkadaşınız var.</span>
          <span class="body-2 pl-5" v-else>Arkadaş listeniz bomboş.</span>
          <v-list-item  class="p-5" flat tile outlined dense  v-for="friend in UserFriends" :key="friend.id">
         
            <v-avatar color="blue mr-1" size="40">
              <img
                :src="friend.avatar"
                alt="John"
              >
            </v-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{friend.fullname}}
              
              </v-list-item-title>
              
              <span class="body-2 success--text" v-if="friend.online">Aktif</span>
              <span class="body-2 dark--text" v-else>Pasif</span>  
            </v-list-item-content>
           
            <v-list-item-action>
              <v-menu bottom left>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      dark
                      icon
                      v-bind="attrs"
                      v-on="on"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>

                  <v-list>
                    <v-list-item
                      dense
                      v-for="(friendAction, i) in UserFriendsActions" 
                      :key="i"
                      v-show="friendActionType(friend,friendAction.types)"
                    >
                      <v-list-item-action class="body-2">
                        <span @click="action(friendAction.methodName,friend)">
                           {{ friendAction.title  }}
                        </span>
                        </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-menu>
            </v-list-item-action>

          </v-list-item>
                  
        </v-list>

      </v-navigation-drawer>

</template>


<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Friend',
  props:["drawer"],
  components: {
    
  },
  data(){
    return {
        
    }
  },
   created(){
      //this.friends.sort((a,b)=>b.online-a.online);
      
    },
    methods:{
      friendAccept(user){
        this.$store.dispatch('UserFriendAcceptsInvition',user);
      },
      friendRefuse(user){
        this.$store.dispatch('UserFriendRefusesInvition',user);
      },
      action(method,user){
          this.$store.dispatch(method,user);
      }
    },
    computed:{
        ...mapGetters([
          'UserFriends',
          'UserFriendsPending',
          'UserFriendsActions'
        ]),
        friendActionType(){
          return function(props,types){
              return types.length == 0 ||  types.every(type => props[type]);
          }
        }
    }
}
</script>
