<template>
     <v-card class="px-5 py-5">

        <v-row  class="align-center mx-5 my-5">

        
          <v-text-field
            v-model="name"
            label="Kullanıcının adı"
             filled 
            rounded 
            dense 
            single-line
            hide-details 
            class="shrink"
          ></v-text-field>
           <v-btn
           class="mx-5"
           small
            color="info"
            @click="bul"
            :disabled="checking"
          >
          Kullanıcı bul
          </v-btn>
          </v-row>
          <div class="body-2 error--text px-5" v-if="isFind">Böyle bir kullanıcı bulunamadı.</div>
          <v-list max-width="500">
              <v-list-item v-for="user in users" :key="user.id" >
                  <v-list-item-avatar color="grey">
                      <v-img :src="user.avatar"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                      <v-list-item-title class="body-2">{{user.fullname}}</v-list-item-title>
                      <v-list-item-subtitle>{{ user.level }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                   
                    <v-btn small :disabled="user.myfriend >= 0" @click="addFriend(user)">
                      <span v-if="user.myfriend == 1">Arkadaşınız</span>
                      <span v-else-if="user.myfriend == 0">Arkadaşlık Gönderildi</span>
                      <span v-else>Arkadaş Ekle</span>
                    </v-btn>
                  </v-list-item-action>
              
              </v-list-item>

          </v-list>

    </v-card>

</template>

<script>

import * as firebase from 'firebase/app';
import "firebase/auth"
import "firebase/firestore"

export default {
    data(){
        return{
            name:'',
            users:[],
            checking:false,
            currentUserId:firebase.auth().currentUser.uid,
            isFind:false
        }
    },
    methods:{
      async bul(){
          if(this.checking) return;
          this.checking = true;
          
          const col = await firebase.firestore().collection('kullanicilar')
          .orderBy('adsoyad').startAt(this.name).endAt(this.name+'\uf8ff');
          this.users = [];

          await col.get().then(querySnapShot =>{
              
              this.isFind =querySnapShot.empty;
              

              querySnapShot.forEach(doc => {
                
                let {adsoyad,avatar,kullaniciid,level} = doc.data();
                /**
                 * Kendi adını listede gösterme
                 */
                if(kullaniciid == this.currentUserId) return; //
                
                if(avatar.length == 0) avatar = this.$store.state.default.avatar;
                const myfriend = this.$store.getters.UserFriends.some(user => user.id == kullaniciid);
                let status;
                if(myfriend){
                  status = 1;
                }else{
                  // davet gönderildiysse 0 değilse -1
                  status = this.$store.getters.UserFriendsPending.some(user => user.id == kullaniciid) ? 0 : -1;
                }
                this.users.push({avatar:avatar,fullname:adsoyad,id:kullaniciid,level:level,myfriend:status});
              })
          });
          this.checking = false;

      },
      async addFriend(user){
          user.myfriend = 0;
          this.$store.dispatch('UserFriendInvite',user);
      }
    },
    created(){
    },
}
</script>