import Vue from 'vue'
import Vuex from 'vuex'

import * as firebase from 'firebase/app';
import "firebase/auth"
import "firebase/firestore"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    modalParams:{
      title:'',
      content:'',
      icon:'',
      open:false
    },
    sounds:{
      time:'/sounds/time.mp3',
      timeTicking:'/sounds/time-ticking-crop.mp3',
      warning:'/sounds/warning.mp3'
    },
    matchData:{
      headers: [
        {
          text: 'Avatar',
          align: 'start',
          sortable: false,
          value: 'avatar',
        },
        { text: 'Rakip', value: 'rakip' },
        { text: 'Puan Sonucu', value: 'puansonuc' },
        { text: 'Durum', value: 'kazandin' },
        { text: 'Tarih', value: 'tarih' }
      ], 
      desserts: [
        /*{
          avatar: 'https://image.freepik.com/free-vector/woman-girl-female-cartoon-avatar-icon_25030-13347.jpg',
          rakip: 'Arya Sadık',
          puansonuc: '5 / 4',
          kazandin:false,
          tarih:'12 May 2020 16:45'
        },*/
        
      ],
      choice:{
        theme:[{tag:'nature',name:'Doğa Tema'},{tag:'animal',name:'Hayvan Tema'},{tag:'random',name:'Rastgele Tema'}], //['Doğa Tema', 'Uzay Tema', 'Yenilmezler Tema', 'Android Tema'],
        mode:[{tag:'slow',name:'Kolay (20 saniye)'},{tag:'normal',name:'Orta (10 saniye)'},{tag:'fast',name:'Zor ( 5 saniye)'}]
      }
    },
    default:{
      avatar:'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png',
    },
    level:{
      minLevel:1,
      maxLevel:100,
    },
    user:{
      auth:"",
      id:0,
      avatar:'',
      fullname:'Kullanıcı 500261',
      joindate:'10 Aralık 2020',
      email:'',
      xp:{
        level:1,
        prev:0,
        current:0,
        next:0
      },
      victory:10,
      defeat:1,
      friends:{
        data:[
          /*{fullname:'Kazım Eray',id:124141,avatar:'https://icon-library.com/images/avatar-png-icon/avatar-png-icon-16.jpg',online:false},*/
        ],
        actions:[
          {title:'Oyun daveti gönder',types:['online'],methodName:'InviteMatch'},
          {title:'Arkadaşlıktan çıkar',types:[],methodName:'UserFriendRemove'}
        ],
        pendingInvitaions:[
          /*{fullname:'Görkem Bayraktar',id:521521,avatar:'https://icon-library.com/images/avatar-png-icon/avatar-png-icon-16.jpg',online:true},*/
        ],

      },
      
    }
  },
  getters:{
    mainModalState(state){
      return state.modalParams.open;
    },
    mainModalParams(state){
      return state.modalParams;
    },
    matchDataHeaders(state){
      return state.matchData.headers;
    },
    matchDataDesserts(state){
      return state.matchData.desserts;
    },
    UserAuth(state){
      return state.user.auth; 
    },
    UserProfile(state){
      return {
        auth:state.user.auth,
        id:state.user.id,
        fullname:state.user.fullname,
        avatar:state.user.avatar,
        level:state.user.xp.level
      }
    },
    UserAvatar(state){
      return state.user.avatar;
    },
    UserFullName(state){
      return state.user.fullname;
    },
    UserJoinDate(state){
      return state.user.joindate;
    },
    UserLevel(state){
      return state.user.xp.level;
    },
    UserXpString(state){
      return state.user.xp.current + ' / ' + state.user.xp.next;
    },
    UserXpPercent(state){
      return (state.user.xp.current - state.user.xp.prev) * 100 / (state.user.xp.next - state.user.xp.prev);
    },
    UserVictoryCount(state){
      return state.matchData.desserts.filter(item => item.kazandin).length;
    },
    UserDefeatCount(state){
      return state.matchData.desserts.filter(item => !item.kazandin).length;
    },
    UserAchievementPercent(state){
      const win = state.matchData.desserts.filter(item => item.kazandin).length ;
      const lose = state.matchData.desserts.filter(item => !item.kazandin).length;
      return Math.floor( win /( win + lose)  * 100 );
    },
    UserFriends(state){
      /**
       * Online: Aktif sırasına göre sırala
       */
      state.user.friends.data.sort((a,b)=>b.online - a.online);
      return state.user.friends.data;
    },
    UserFriendsPending(state){
      return state.user.friends.pendingInvitaions;
    },
    UserFriendsActions(state){
      return state.user.friends.actions;
    }
  },
  mutations: {
    mainModalClose(state){
      state.modalParams.open = false;
    },
    mainModalOpen(state,params){
      state.modalParams.title = params.title;
      state.modalParams.content = params.content;
      state.modalParams.icon = params.icon;
      state.modalParams.open = true;
    },
    UserFriendPendingInvitionsRemove(state,user){
      state.user.friends.pendingInvitaions = state.user.friends.pendingInvitaions.filter(pending => pending.id !== user.id);
    },
    UserFriendPendingInvitionsAppend(state,user){
      if(state.user.friends.pendingInvitaions.some(friend => friend.id == user.id)) return;
      if(!user.avatar || user.avatar.length == 0) user.avatar =  state.default.avatar;
      state.user.friends.pendingInvitaions.push(user);
    },
    UserFriendRemove(state,user){
      state.user.friends.data = state.user.friends.data.filter(data => data.id !== user.id);
    },
    UserFriendAppend(state,user){
      if(state.user.friends.data.some(friend => friend.id == user.id)) return;
      if(user.avatar.length == 0) user.avatar =  state.default.avatar;
      user.online = false;
      state.user.friends.data.push(user);
    },
    UserFriendOnline(state,list){
      if(state.user.friends.data.length){
        state.user.friends.data = state.user.friends.data.map(friend => {
            friend.online = list.some(item => item == friend.id);
            return friend;
        })
      }
      
    },
    UserAuth(state,auth){
      state.user.auth = auth;
    },
    SetUserId(state,id){
      state.user.id = id;
    },
    SetUserInit(state,{id,email}){
      state.user.id = id;
      state.user.email = email;
    },
    SetUser(state,data){
      state.user.avatar = data.avatar.length > 0 ? data.avatar : state.default.avatar;
      state.user.fullname = data.fullname.length > 0 ? data.fullname : 'Tanımsız';
    },
    SetXp(state,data){
      state.user.xp.level = data.level;
      state.user.xp.current = data.xp;
      state.user.xp.next = data.nextxp;
      state.user.xp.prev = data.prev;
    },
    SetXpIncrement(state,xp){
      state.user.xp.current = state.user.xp.current + xp;
    },
    async UpdateFullName(state,fullname){
        const usersRef = await firebase.firestore().collection('kullanicilar').doc(state.user.id);
        usersRef.get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            
            usersRef.update({
              adsoyad:fullname,
            }) // create the document
          } else {
            usersRef.set({
              adsoyad:fullname,
              avatar:'',
              kullaniciid:state.user.id,
              xp:0
            }) // create the document
          }
          state.user.fullname = fullname;
      });

    },
    async matchData(state,data){
      state.matchData.desserts = data;
    }

  },
  actions:{
    async UserFriendInvite({state},user){
      const userRef = await firebase.firestore().collection('kullanicilar').doc(user.id);
      const senderRef = await firebase.firestore().collection('kullanicilar').doc(state.user.id); // mine
      const col = await firebase.firestore().collection('arkadaslar')
      .where('gonderenkullaniciRef','==',senderRef)
      .where('alicikullaniciRef','==',userRef)

      await col.get().then(querySnapShot =>{
 
        if(querySnapShot.empty || querySnapShot.docs.every(doc => doc.data().kabul == -1)){

            firebase.firestore().collection('arkadaslar').add({
              alicikullaniciRef:userRef,
              gonderenkullaniciRef:senderRef,
              kabul:0,
              kabulTarih:''
            });

        }else{
            /**
             * Eğer böyle bir kayıt varsa benim arkadaşımdır
             */
            console.log('Arkadaşlık onay bekliyor ya da arkadaşsınız.');
        }


      });
    },
    async UserFriendRefusesInvition({commit},user){
      const userRef = await firebase.firestore().collection('arkadaslar').doc(user.docid);
      await userRef.update({kabul:-1});
      commit('UserFriendPendingInvitionsRemove',user);
    },
    async UserFriendAcceptsInvition({commit},user){
      const userRef = await firebase.firestore().collection('arkadaslar').doc(user.docid);
      await userRef.update({kabul:1});
      commit('UserFriendAppend',user);
      commit('UserFriendPendingInvitionsRemove',user);
    },
    async UserFriendRemove({commit},user){
      const userRef = await firebase.firestore().collection('arkadaslar').doc(user.docid);
      await userRef.update({kabul:-1});
      commit('UserFriendRemove',user);
    },
    InviteMatch(){

    },
    async GetLevelForXp({state,dispatch},xp){
      if(xp < 0) return 1;
     
       
      
      let i = 1;
      let a;
      while( i <= state.level.maxLevel){
        a = await dispatch('GetXpForLevel',i); 
        if(xp < a){
          return i-1;
        }
        i++;
      }
        
      return state.level.maxLevel;
    },
    GetXpForLevel({state},level){
      if(level > state.level.maxLevel) level = state.level.maxLevel;
      else if(level < state.level.minLevel) level = state.level.minLevel;

      let x = 10000 * (level / state.level.maxLevel) * (Math.log(level)) * 1.2;
      x = Math.floor(x);
      return x; 
    },
    async UserXPInit({commit,dispatch},xp){
      const level = await dispatch('GetLevelForXp',xp);
      commit('SetXp',
      {
        xp:xp,
        nextxp: await dispatch('GetXpForLevel',level+1),
        level:level,
        prev: await dispatch('GetXpForLevel',level)
      }
      );
    },
    async UserAddXp({state,commit,dispatch},xp){
      console.log(state.user.xp.current + xp,state.user.xp.next)
      if( state.user.xp.current + xp >=state.user.xp.next){
        await dispatch('UserXPInit',state.user.xp.current + xp);
      }else{
        commit('SetXpIncrement',xp);
      }

    }
  }
})
