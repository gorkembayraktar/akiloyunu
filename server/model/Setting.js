
const data  = {
  themes:{
      nature:'DOĞA TEMA',
      random:"RATGELE TEMA",
      animal:"Hayvan TEMA"
  },
  targetScore:1,//OYUN BİTİŞ SKORU
  themeFormat:'{gameTheme}/{id}.jpg',
  modes:{
      fast : 5,
      normal:10,
      slow:20
  },
  messages:{
      "game-started":{code:"1000",message:'Oyun başlıyor..'},
      "game-settings-not-valid":{code:'1001',message:"Oyun teması ya da modu sınırların dışında."}
  },
  
  TEMA_RESIMLERI_GETIR: function(tema){
      const times = 10;
      const obj = {
          "{gameTheme}":tema,
          "{id}":0
      };
      let images = [];
      for(let i = 1 ; i <= times;i++){
          obj["{id}"] = i;        
          images.push(
              {
                  id:i,
                  img:data.themeFormat.replace(/{gameTheme}|{id}/gi, (matched) =>obj[matched]),
                  isOpen:false
              }
          )
      }
      return images;
    },
    
    OYUN_MOD_SURESI: function(mod){
        return data.modes[mod];
    },
    OYUN_TEMA_KONTROL: function(tema){
        if(data.themes[tema])
            return true;
        return false;
    },
    OYUN_MOD_KONTROL: function(mod){
        if(data.modes[mod])
            return true;
        return false;
    }
};

module.exports = data;