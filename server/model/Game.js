class Game{
    constructor(io,setting){
        this.io = io;
        this.Setting = setting;
        this.pending = [];
        this.games = {};
        this.onlineUsers = {};

        //oyun isteği gönder
        this.invites = [];/**{userid:} */
    }

    getGame(game_id){
        return this.games[game_id];
    }    
    YENI_OYUN_OLUSTUR(pendingUser,newUser,gameTheme,gameMode){
        // bekleyenlerden kulanıcıyı kaldır
        this.KULLANICI_BEKLEYENDEN_KALDIR(pendingUser.user.id);
        //pending = pending.filter(user => user.id != pendingUser.user.id);
        // yeni oda oluştur
        const TEMA_RESIMLERI = this.Setting.TEMA_RESIMLERI_GETIR(gameTheme);
        const MOD_SURESI = this.Setting.OYUN_MOD_SURESI(gameMode);
        const GAMEID = this.CREATE_GAME_ID();
        let template = {
            [GAMEID]:{
                gameId:GAMEID,
                gameMode:gameMode,
                gameTheme:gameTheme,
                gameCreated:Date.now(),
                isStart:false,
                isContinue:false,/* match contionus */
                order:this.ANY_USER_ID(pendingUser.user.id,newUser.user.id),
                cards:this.SHUFFLE(TEMA_RESIMLERI).concat(this.SHUFFLE(TEMA_RESIMLERI)),
                openCards:[],
                targetScore:this.Setting.targetScore,/* default over score */
                TIMER/*game builder*/:{
                    interval:null,/** down counter for order */
                    perMS:1000,/** REPEAT A PER SECOND - 1000 ms */
                    maxsecond:MOD_SURESI,
                    second:MOD_SURESI
                },
                turnCount:0,
                users:{
                    [pendingUser.user.id]:{
                        auth:pendingUser.user.auth,
                        id:pendingUser.user.id,
                        socket:pendingUser.user.socket,
                        fullname:pendingUser.user.fullname,
                        level:pendingUser.user.level,
                        avatar:pendingUser.user.avatar,
                        score:0,
                        requestCount:0,
                        connected:false
                    },
                    [newUser.user.id]:{
                        auth:newUser.user.auth,
                        id:newUser.user.id,
                        socket:newUser.user.socket,
                        fullname:newUser.user.fullname,
                        level:newUser.user.level,
                        avatar:newUser.user.avatar,
                        score:0,
                        requestCount:0,
                        connected:false
                    }
                }
            }
        }

        pendingUser.user.socket.join(GAMEID);
        newUser.user.socket.join(GAMEID);

        this.games[GAMEID] = template[GAMEID];


        this.io.sockets.in(GAMEID).emit('matching join',{go:'/game/'.concat(GAMEID)});
    }
    
    OYUN_BASLAT(gameid){
        this.games[gameid].isStart = true;
        this.games[gameid].isContinue = true;
    }

        
    async OYUN_BITIR(gameid,userid){

        
        const winner = this.OYUN_KULLANICI_GETIR(gameid,userid);
        const opposite = this.RAKIP_KULLANICI_BILGILERI(gameid,userid);
        this.io.sockets.in(gameid).emit('game over',{winner : winner });

        const puan = Math.abs(winner.score - opposite.score) * 100;
        delete this.games[gameid];
        
        return {
            winner:{
                id:winner.id,
                xp:puan,
                data:winner
            },
            loser:{id:opposite.id,xp:Math.floor(puan * 0.4),data:opposite}
        };

      
    }


    KULLANICI_AYRILDI(gameID){
        if(this.games[gameID]){
           this.io.sockets.in(gameID).emit("user leave",1);     
           delete this.games[gameID];
        }
    }
    BEKLEYENLERI_DENETLE(user){ 
        for(let i = 0 ;  i< this.pending.length;i++){
            if(this.pending[i].gameTheme == user.gameTheme && this.pending[i].gameMode == user.gameMode){
                this.YENI_OYUN_OLUSTUR(this.pending[i],user,this.pending[i].gameTheme,this.pending[i].gameMode);
                return;
            } 
        }
        this.BEKLEYENLERE_KAYDET(user);
    }
    KULLANICI_BEKLEYENDEN_KALDIR(userid){
        this.pending = this.pending.filter(p => p.user.id != userid);
    }
    KULLANICI_OYUNDAMI(userid){
        return Object.keys(this.games).length > 0 && Object.values(this.games).some(game => game.users[userid] != undefined);
    }

    KULLANICI_OYUNODASINDA_MI(gameid,userid){
        const getid = this.OYUN_ID_GETIR(userid);
        if(getid)
           if(getid == gameid){
                this.KULLANICI_ODAYA_BAGLANDI(userid);
                return true;
           } 
        
        return false;
    }
    KULLANICILAR_ODAYA_BAGLANDI_MI(gameid){
        return Object.values(this.games[gameid].users).every(user => user.connected);
    }
    KULLANICI_ODAYA_BAGLANDI(userid){
        const gameid = this.OYUN_ID_GETIR(userid);
        this.games[gameid].users[userid].connected = true;
    }
    OYUN_KULLANICI_BILGILERI(gameid){
        let users = {};
        Object.keys(this.games[gameid].users).forEach(user => {
            users[user] = {
                id:this.games[gameid].users[user].id,
                avatar:this.games[gameid].users[user].avatar,
                level:this.games[gameid].users[user].level,
                fullname:this.games[gameid].users[user].fullname,
                score:this.games[gameid].users[user].score
            }
        });
        return users;
    }
    OYUN_KULLANICI_GETIR(gameid,userid){
        return {
            auth:this.games[gameid].users[userid].auth,
            id:this.games[gameid].users[userid].id,
            fullname:this.games[gameid].users[userid].fullname,
            avatar:this.games[gameid].users[userid].avatar,
            level:this.games[gameid].users[userid].level,
            score:this.games[gameid].users[userid].score
        };
    }
    SOCKET_ID_OYUN_GETIR(socketid){
        const find = Object.values(this.games).find(game => Object.values(game.users).some(user => user.socket.id == socketid ));
        if(find){
            return find;
        }
        return "";
    }
    RAKIP_KULLANICI_BILGILERI(gameid,userid){
        const oppositeid = Object.keys(this.games[gameid].users).filter(user => user != userid);
    
        return {
            auth:this.games[gameid].users[oppositeid].auth,
            id:this.games[gameid].users[oppositeid].id,
            fullname:this.games[gameid].users[oppositeid].fullname,
            avatar:this.games[gameid].users[oppositeid].avatar,
            level:this.games[gameid].users[oppositeid].level,
            score:this.games[gameid].users[oppositeid].score
        };
    
    }
    OYUN_ID_GETIR(userid){
        const find = Object.values(this.games).find(game => game.users[userid] != undefined);
        if(find){
            return find.gameId;
        }
        return "";
    }
    BEKLEYENLERE_KAYDET(user){
       
        this.pending.push(user);
    }

    OYUN_ISTEK_EKLE(data){
        this.invites.push(data);
    }

    OYUN_ISTEK_KABUL(invite_id,user){
        const invite = this.invites.find(i => i.invite_id == invite_id);

        if(invite){
            invite.to = user;

            this.YENI_OYUN_OLUSTUR({user:invite.from},{user:invite.to},invite.info.theme,invite.info.mode);
            this.INVITE_ID_SIL(invite_id);
            return;
        }
    }
    INVITE_ID_SIL(invite_id){
        this.invites = this.invites.filter(i => i.invite_id != invite_id);
    }

    CREATE_GAME_ID(){
        const current_game_ids = Object.keys(this.games);
        var id ="";
        const ROOMLENGTH = 12;
        const times = 5;
        let trycount = 0;
        const data = 'ABCDEFGHJKLMNOPRSTUVWXYZ0123456789'.split('');
        do{
            id ="";
            for(let i = 0; i<ROOMLENGTH;i++){
                id+= data[~~(Math.random() * data.length)];
            }
            trycount++;
        }while(current_game_ids.some(gameid => gameid == id) && trycount <= times)
        if(trycount>times) return id.concat(this.randomInteger(1,9));
        return id;
    }
    randomInteger(min,max){
        return Math.floor(Math.random() * (max-min)) + min;
    }
    SHUFFLE(items) {
        let array = items.map(item => item);
        let currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
        return array;
    }
    UNIQ_ID(){
        return  Math.random().toString(16).slice(2);
    }
      
    ANY_USER_ID(u1,u2){
        if(~~(Math.random() * 2)){
            return u1;
        }
        return u2;
    }
    
}

module.exports = Game;