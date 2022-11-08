const admin = require('firebase-admin');
var serviceAccount = require("./../kartacmaoyunu-firebase-adminsdk-g40g9-8eb894efe6.json");

const config = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kartacmaoyunu.firebaseio.com"
};
admin.initializeApp(config);




const data = {
    getDoc: async function(id){

      /*return await admin.firestore().collection('kullanicilar').doc(id);*/
      return await admin.firestore().collection('kullanicilar')
      .where("kullaniciid","==",id).limit(1);
    },
    setXp: async function(user){

      /*if( await data.CheckAuth(ref.auth,user.id)){
    
          return await ref.get().then(async doc => {
                      return await ref.update({xp : doc.data().xp + user.xp})
                  });

          
      }else{
        console.info("Oturum hatası.");
      }*/
        const ref = await data.getDoc(user.id);
        await ref.get().then(async querySnapshot => {
          querySnapshot.forEach(async documentSnapshot => {
            //console.log(`Found document at ${documentSnapshot.ref.path}`);
            
            await documentSnapshot.ref.update({xp:documentSnapshot.data().xp + user.xp});
         
    
          });
        });
    
         

     
    },
    CheckAuth: async function(auth,userid){
    
      return await admin.auth().verifyIdToken(auth)
      .then(function(decodedToken) {
          let uid = decodedToken.uid;
          return uid == userid;
      }).catch(function(error) {
          //console.log(error);
          return false;
      });
  },
  async getRef(userid){
      const ref =  await data.getDoc(userid);
      return await ref.get().then(querySnapshot => {
        let ref;
        querySnapshot.forEach(async documentSnapshot => {
          //console.log(`Found document at ${documentSnapshot.ref.path}`);
            ref = documentSnapshot.ref;
        });
        return ref;
      });
  },
  MatchAdd(ref,sonuc,opposite){
    admin.firestore().collection("maclar").add({
      kullaniciRef:ref,
      durum:1,
      macsonuc:sonuc,
      rakipRef:opposite,
      tarih:Date.now()
  });
  }
};

module.exports = data;