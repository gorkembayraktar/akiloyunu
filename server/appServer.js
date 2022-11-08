const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http,{
    /*path: '/socket.io-client'*/
  });

io.set("origins", "*:*");
io.set('transports', ['websocket']);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });
app.get('/',(req,res)=>{
    res.header
    res.end('working');
})

const PORT =  process.env.PORT || 3000;

const firebase = require('firebase/app');
firebase.initializeApp(require('./firebaseconfig').default);

require('firebase/database');
require('firebase/firestore');


const GAME_SETTINGS = require('./model/Setting');
const GAMECLASS = require('./model/Game');
const GAME = new GAMECLASS(io,GAME_SETTINGS);
const FirebaseAdmin = require('./model/FirebaseAdmin');




const socketMethods = {
    'init2':function(userid){

        this.socket.join(userid);

        GAME.onlineUsers[this.socket.id] = userid;
        
        this.socket.broadcast.emit('init2',Object.values(GAME.onlineUsers));
        this.socket.emit('init2',Object.values(GAME.onlineUsers));
    },
    "match-invite":function(data){

        const invite_id = GAME.UNIQ_ID();

        data.from.socket = this.socket;
        GAME.OYUN_ISTEK_EKLE({
            invite_id : invite_id,
            from:data.from,
            info:data.info,
            to:null,
            _to:data.to
        });


        this.socket.in(data.to.id).emit('match-invite',{
            user:{
                fullname:data.from.fullname,
                level:data.from.xp.level,
                avatar:data.from.avatar,
                id:data.from.id
            },
            info:{
                mode:data.info.mode,
                theme:data.info.theme,
                invite_id:invite_id
            }
        });
    },  
    "match-invite-accept":function(data){
        // daveti kabul etti oyun oluştur.
        data.user.socket = this.socket;
        GAME.OYUN_ISTEK_KABUL(data.invite_id,data.user);
        
        // 2 kullanıcının beklemesini kaldır
        //GAME.KULLANICI_BEKLEYENDEN_KALDIR(data.userid);
    },
    'match-status-checking':function(user){
        if(GAME.KULLANICI_OYUNDAMI(user.id)){
            this.socket.emit('match-status-checking',
            {
                isPlaying:GAME.KULLANICI_OYUNDAMI(user.id),
                gameID:GAME.OYUN_ID_GETIR(user.id)
            });
        }else{
            this.socket.emit('match-status-checking',{isPlaying:false});
        }
    },
    'matching':async function(user){

        /*let x = await FirebaseAdmin.getDoc(user.user.id);


        console.log(x);
        return;

        FirebaseAdmin.setXp(x,{xp:15});
        
        return;
        */

        if(GAME_SETTINGS.OYUN_MOD_KONTROL(user.gameMode) && GAME_SETTINGS.OYUN_TEMA_KONTROL(user.gameTheme)){
            user.user.socket = this.socket;
            GAME.BEKLEYENLERI_DENETLE(user);
        }else{
            // fatal error
            this.socket.emit('matching-error',GAME_SETTINGS.messages['game-settings-not-valid'])
        }
    },
    'matching-cancel':function(user){
        GAME.KULLANICI_BEKLEYENDEN_KALDIR(user.id);
    },
    'matching-gameid-control':function(user){
        const state = GAME.KULLANICI_OYUNODASINDA_MI(user.gameid,user.id);
        this.socket.emit("matcing-gameid-control",{state,gameid:user.gameid,id:user.id});
        if(state){
            const connectionstatus = GAME.KULLANICILAR_ODAYA_BAGLANDI_MI(user.gameid);
            if(connectionstatus){
                GAME.KULLANICI_ODAYA_BAGLANDI(user.id);
                io.sockets.in(user.gameid).emit("game started",
                {
                    order:GAME.getGame(user.gameid).order,
                    users:GAME.OYUN_KULLANICI_BILGILERI(user.gameid),
                    state:[GAME_SETTINGS.messages['game-started']],
                    opens:GAME.getGame(user.gameid).cards.filter(card =>{ 
                        if(card.isOpen){
                            return card.id
                        }
                    }) 
                });

                GAME.OYUN_BASLAT(user.gameid);
            }
                
        }
    },
    'game card turn':async function( {user,cardId}){
        const gameID = GAME.OYUN_ID_GETIR(user.id);

        if(!gameID) return;

        const gameItem = GAME.getGame(gameID);

        if(gameItem.isContinue && user.id == gameItem.order){

            io.sockets.in(gameID)
                .emit('game card turn', 
                {error:false,cardId:cardId,card : gameItem.cards[cardId] } );
            
                gameItem.users[user.id].requestCount = gameItem.users[user.id].requestCount + 1;
                gameItem.openCards.push({
                img:gameItem.cards[cardId].img,
                id:cardId
            });

            if(gameItem.users[user.id].requestCount == 2){

                    gameItem.turnCount = gameItem.turnCount + 1;

                    const openCards = gameItem.openCards;

                    if(openCards[openCards.length - 1].img == openCards[openCards.length - 2].img){
                        gameItem.users[user.id].score =gameItem.users[user.id].score + 1;
                        
                        io.sockets.in(gameID)
                        .emit('game card result',{state:true, won : user.id,users:GAME.OYUN_KULLANICI_BILGILERI(gameID)});

                        if(gameItem.users[user.id].score == gameItem.targetScore){

                            const result = await GAME.OYUN_BITIR(gameID,user.id);

                            await FirebaseAdmin.setXp({id:result.winner.id,xp:result.winner.xp});
                            await FirebaseAdmin.setXp({id:result.loser.id,xp:result.loser.xp});
                            const winnerRef =  await FirebaseAdmin.getRef(result.winner.id);
                            const loserRef =  await FirebaseAdmin.getRef(result.loser.id);
                            FirebaseAdmin.MatchAdd(winnerRef,result.winner.data.score +" / "+result.loser.data.score,loserRef);
                            FirebaseAdmin.MatchAdd(loserRef,result.loser.data.score +" / "+result.winner.data.score,winnerRef);
        
                            if(gameItem.TIMER.interval){
                                clearInterval(gameItem.TIMER.interval);
                            }

                           /* const winnerDoc = FirebaseAdmin.getDoc(result.winner.id);
                            const loserDoc = FirebaseAdmin.getDoc(result.loser.id);
                            FirebaseAdmin.setXp(winnerDoc,result.winner);
                            FirebaseAdmin.setXp(loserDoc,result.loser);
                            FirebaseAdmin.MatchAdd(winnerDoc,winner.score +" / "+opposite.score,loserDoc);
                            FirebaseAdmin.MatchAdd(loserDoc,opposite.score +" / "+winner.score,winnerDoc);

                            */

                        }


                        gameItem.openCards = [];
                    }else{
                        
                        io.sockets.in(gameID)
                                    .emit('game card result',
                                    {state:false,ids:gameItem.openCards.map(card => card.id)});
                                    
                        if(gameItem.TIMER.interval){
                            clearInterval(gameItem.TIMER.interval);
                            gameItem.TIMER.second = gameItem.TIMER.maxsecond;
                        }

                        gameItem.TIMER.interval = setInterval(function(){

                            if(gameItem == undefined){
                                return;
                            }else if(!gameItem.isContinue){
                                clearInterval(gameItem.TIMER.interval);
                                return;
                            }
                        
                          
                            io.sockets.in(gameID)
                            .emit('game timer',{second:gameItem.TIMER.second});
                        
                            gameItem.TIMER.second  = gameItem.TIMER.second - 1;
                            
                            if(gameItem.TIMER.second == 0){
    
                                if(gameItem.users[gameItem.order].requestCount == 1){
                                    
                                    gameItem.users[gameItem.order].requestCount = 0;
                                    io.sockets.in(gameID)
                                    .emit('game card result',{state:false,ids:[gameItem.openCards[0].id]});
                                    
                                    
                                }
                            
                                gameItem.order = Object.keys(gameItem.users).find(guid=> guid != gameItem.order);
                                gameItem.TIMER.second = gameItem.TIMER.maxsecond;
                                io.sockets.in(gameID).emit('game card turnchange',{order:gameItem.order});
                                
                            }
    
    
                            
                        },1000);               


                    }/**#END else img equals */

                    
                    gameItem.openCards = [];

                    gameItem.users[user.id].requestCount = 0;
                    
                    gameItem.order = Object.keys(gameItem.users).find(guid=> guid != user.id);
                    
                    io.sockets.in(gameID).emit('game card turnchange',{order:gameItem.order});
                    
                    

            }

            
        }else{
            io.sockets.in(gameID).emit('game card turn',{error:true});
        }
    },
    'join-already-game':function(data){
        //data.userid

        const gameItem = GAME.getGame(data.gameid);
        if(gameItem){

            if(gameItem.isContinue == false){
                this.socket.emit("no-active-game",1);
                return;
            }

            gameItem.users[data.id].socket = this.socket;
            this.socket.join(data.gameid);

            io.sockets.in(data.gameid).emit("game started",
            {
                order:GAME.getGame(data.gameid).order,
                users:GAME.OYUN_KULLANICI_BILGILERI(data.gameid),
                state:[GAME_SETTINGS.messages['game-started']],
                opens:GAME.getGame(data.gameid).cards.filter(card =>{ 
                    if(card.isOpen){
                        return card.id
                    }
                }) 
            });

        }
    },
    'game message':function(data){
        io.sockets.in(data.gameID).emit('game message',data.user);
    },
    'user leave':async function(user){

        const detail = GAME.getGame(user.gameID);

        if(detail){
            const birinci = Object.keys(detail.users).find(user => user.socket != this.socket);
            const inf = detail.users[birinci];
            /**Kalan kullanıcıya xp ver */
            await FirebaseAdmin.setXp({id:inf.id,xp:125});

        }
        GAME.KULLANICI_AYRILDI(user.gameID);

    },
    'online-alive':function(){
        this.socket.emit('online-alive',{alive:this.socket.client.conn.server.clientsCount})
    },
    'disconnect':function(){
        this.socket.broadcast.emit('online-alive',{alive:this.socket.client.conn.server.clientsCount})
        
        delete GAME.onlineUsers[this.socket.id];
        this.socket.broadcast.emit('init2',Object.values(GAME.onlineUsers));
        this.socket.emit('init2',Object.values(GAME.onlineUsers));

        const gameid = GAME.SOCKET_ID_OYUN_GETIR(this.socket.id);
        if(gameid){
            GAME.KULLANICI_AYRILDI(gameid);
        }

        this.socket.broadcast.emit("init2",Object.values(GAME.onlineUsers));

    }

};


io.on('connection', (socket) => {


    
    Object.keys(socketMethods).forEach(key => {
        socket.on(key,socketMethods[key].bind({socket}))
    });
    socket.broadcast.emit('online-alive',{alive:socket.client.conn.server.clientsCount})

    setTimeout(function(){
        socket.broadcast.emit("init2",Object.values(GAME.onlineUsers));
    },10*1000);
    socket.broadcast.emit("init2",Object.values(GAME.onlineUsers));
});

/** PER 10 SECONDS ONLINE USERS INIT */
/*setInterval(()=>{
    io.emit("init2",Object.values(GAME.onlineUsers));
},1000 * 10);*/

http.listen(PORT,()=>console.log('bağlantı başarılı şekilde kuruldu port :'+PORT));






