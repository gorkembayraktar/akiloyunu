<template>


    <v-app-bar app clipped-left class="grey darken-4 white--text">
                <v-toolbar-title>
                        <router-link
                            to="/"
                            style="text-decoration:none;color:currentColor;"
                        >
                        <v-row class="mx-0 my-0 px-0 py-0 align-items-center" style="align-items:center;">
                            <v-img position="center" style="width:50px" src="logo.png?v=2" />
                            <span class="ml-3">Eşini Bul Oyunu</span>

                        </v-row>
                    </router-link>
                </v-toolbar-title>
                
                <v-spacer/>
                <span class="mx-5">Online : {{onlineCount}}</span>
                <span>

                <v-switch height="30" class="red--text mt-5" v-model="theme"  color="#f45525" label="Açık Mod"></v-switch>

                </span>
                <v-menu bottom left>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                            dark
                            icon
                            v-bind="attrs"
                            v-on="on"
                            >
                            <v-icon color="blue">mdi-help</v-icon>
                            </v-btn>
                        </template>

                        <v-list>
                            <v-list-item
                            v-for="(staticMenu, i) in staticMenus" 
                            :key="i"
                            link
                            :to="staticMenu.to"
                            >
                            <v-list-item-title class="body-2">{{ staticMenu.title  }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                </v-menu>
                <v-app-bar-nav-icon class="white--text" @click="changeDrawer"></v-app-bar-nav-icon>
</v-app-bar>
    
</template>

<style lang="scss">
#switch-theme {
   color: white !important;
}
</style>

<script>

import * as firebase from 'firebase/app';
import "firebase/auth"
import "firebase/firestore"

export default {
    name:'Content',
    props:["drawer"],
    data(){
        return {
            theme:false,
            onlineCount:0,
            staticMenus:[
                {title:'Nasıl Oynanır ?',to:'/nasil-oynanır'},
                {title:'Gizlilik politikası',to:'/gizlilik'},
                {title:'Hakkımızda',to:'/hakkimizda'}
            ]
        }
    },
    sockets:{
        ["init2"](data){
           
            this.$store.commit('UserFriendOnline',data);
        },
        ["online-alive"](data){
            this.onlineCount = data.alive;
        }

    },
    async created(){
        const user = firebase.auth().currentUser;

        this.$socket.emit('online-alive');
        this.$socket.emit('init2',user.uid);
         if(localStorage.getItem("theme-dark") == "false"){
            this.$vuetify.theme.dark = false;
            this.theme = true;
        }else{
            this.theme = false;
            this.$vuetify.theme.dark = true;
        }

      
        firebase.auth().currentUser.getIdToken(true).then(auth =>
            this.$store.commit('UserAuth',auth)
        );

        
        this.$store.commit('SetUserInit',{'email':user.email,"id":user.uid});
        const userRef = await firebase.firestore().collection('kullanicilar').doc(user.uid);
        userRef.get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {

              const {avatar,adsoyad,xp}  = docSnapshot.data();
              this.$store.commit('SetUser',{avatar:avatar,fullname:adsoyad}); 
              this.$store.dispatch('UserXPInit',xp); 
          } 
        });

        const matchData = await firebase.firestore().collection('maclar').where('kullaniciRef','==',userRef).get();
        if(!matchData.empty){
            
            let matches = [];
            matchData.forEach(async(doc)=>{

                const data = doc.data();
                const date = new Date(data.tarih);
                const date_str = date.toDateString() + " " + date.toLocaleTimeString();
                const rakip = await data.rakipRef.get();
                const rakipData = rakip.data();
                matches.push({
                        avatar: rakipData.avatar.length > 0 ? rakipData.avatar : this.$store.state.default.avatar,
                        rakip: rakipData.adsoyad,
                        puansonuc: data.macsonuc,
                        kazandin:data.durum == 1,
                        tarih:date_str
                })


            })
            this.$store.commit('matchData',matches);

        }

        


        /**
         * Arkadaşlık daveti gönderdiğim kullanıcılar
         *  */ 

        const friendsRef = firebase.firestore().collection('arkadaslar');
        const friendSnapshot = await friendsRef
        .where('gonderenkullaniciRef','==',userRef)
        .where('kabul','==',0)
        .get();

      
        if(!friendSnapshot.empty){
            friendSnapshot.forEach(async (doc) => {

                if(doc.data().alicikullaniciRef){
                    
                    console.log(doc);

                    doc.data().alicikullaniciRef.get().then(async res => {
                        const {avatar,adsoyad,xp}  = res.data();
                        
                        let levelforxp = await this.$store.dispatch('GetLevelForXp',xp);
                        /*this.$store.commit('UserFriendAppend',
                        {avatar:avatar,fullname:adsoyad,level:levelforxp,id:res.id,docid:doc.id});*/
                        
                        this.$store.commit('UserFriendSendingInvitionsAppend',
                        {avatar:avatar,
                        fullname:adsoyad,
                        level:levelforxp,
                        id:res.id,
                        docid:doc.id
                        });


                    })
                }
               
               
                
            });
        }

        /**
         * Arkadaşlık daveti aldıklarım
         */
        const aliciSnapshot = await friendsRef
        .where('alicikullaniciRef','==',userRef)
        .get();
        if(!aliciSnapshot.empty){
            aliciSnapshot.forEach(async (doc) => {
                const data = doc.data();
                /**
                 * 
                 */
                 
                 data.gonderenkullaniciRef.get().then(async (res) => {
                    const x = res.data();
                    if(!x)return;

                    const adsoyad = x.adsoyad;
                    const avatar = x.avatar.length > 0 ? x.avatar : this.$store.state.default.avatar;
                    const kullaniciid = x.kullaniciid;
                    const xp = x.xp; 
                    let levelforxp = await this.$store.dispatch('GetLevelForXp',xp);
                    if(data.kabul == 1){
                        this.$store.commit('UserFriendAppend',{avatar:avatar,fullname:adsoyad,level:levelforxp,id:kullaniciid,docid:doc.id});
                    }else if(data.kabul == 0){
                        this.$store.commit('UserFriendPendingInvitionsAppend',{avatar:avatar,fullname:adsoyad,level:levelforxp,id:kullaniciid,docid:doc.id});
                    }
                });

            });
        }

    //** GÖNDERDİKLERİM */
         const gondericiSnapshot = await friendsRef
        .where('gonderenkullaniciRef','==',userRef)
        .get();
        if(!gondericiSnapshot.empty){
            gondericiSnapshot.forEach(async (doc) => {
                const data = doc.data();
                /**
                 * 
                 */
                 
                 data.alicikullaniciRef.get().then(async (res) => {
                    const x = res.data();
                    if(!x)return;

                    const adsoyad = x.adsoyad;
                    const avatar = x.avatar.length > 0 ? x.avatar : this.$store.state.default.avatar;
                    const kullaniciid = x.kullaniciid;
                    const xp = x.xp; 
                    let levelforxp = await this.$store.dispatch('GetLevelForXp',xp);
                    if(data.kabul == 1){
                        this.$store.commit('UserFriendAppend',{avatar:avatar,fullname:adsoyad,level:levelforxp,id:kullaniciid,docid:doc.id});
                    }else if(data.kabul == 0){
                        this.$store.commit('UserFriendPendingInvitionsAppend',{avatar:avatar,fullname:adsoyad,level:levelforxp,id:kullaniciid,docid:doc.id});
                    }
                });

            });
        }

        let cache = true;
        firebase.firestore().collection('arkadaslar').onSnapshot(querySnapshot  => {
            if(cache) {
                cache = false;
                return;
            }
            querySnapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    const data = change.doc.data();

                    const alici = await data.alicikullaniciRef.get();

                    if(alici.data().kullaniciid == user.uid){
                        
                        const gonderen = await data.gonderenkullaniciRef.get();
                        const g = gonderen.data();
                        let levelforxp = await this.$store.dispatch('GetLevelForXp',g.xp);
                        this.$store.commit('UserFriendPendingInvitionsAppend',
                        {docid:change.doc.id,
                        id:g.kullaniciid,
                        fullname:g.adsoyad,
                        avatar:g.avatar,
                        level:levelforxp});
                    }

                }else if (change.type === 'modified') {

                    const data = change.doc.data();
                    const gonderen = await data.gonderenkullaniciRef.get();
                 
                 
                    
                    if(data.kabul == 1){
                        if(gonderen.data().kullaniciid == user.uid){
                            const alici = await data.alicikullaniciRef.get();
                            const aliciData = alici.data();
                            let levelforxp = await this.$store.dispatch('GetLevelForXp',aliciData.xp);
                            this.$store.commit('UserFriendAppend',
                            {
                                docid:change.doc.id,
                                id:aliciData.kullaniciid,
                                avatar:aliciData.avatar,
                                fullname:aliciData.adsoyad,
                                level:levelforxp
                            });
                        }
                    }else if(data.kabul == -1){
                             const alici = await data.alicikullaniciRef.get();  
                             const aliciData = alici.data();     
                            
                            this.$store.commit('UserFriendRemove',{id:gonderen.data().kullaniciid});
                        
                            this.$store.commit('UserFriendRemove',{id:aliciData.kullaniciid});
                        }
                    
                    
                }else if (change.type === 'removed') {
                    console.log('Removed');
                }
            });
        })

      

       
    },
    methods:{
        changeDrawer(){
            this.$emit('drawer',!this.drawer);
        }
    },
    watch:{
        theme:function(state){

            if (state) {
					localStorage.setItem("theme-dark", "false");
            } else {
                    localStorage.setItem("theme-dark", "true");
            }
            this.$vuetify.theme.dark = !state;
        }
    }
}
</script>

<style lang="scss" scoped>

</style>