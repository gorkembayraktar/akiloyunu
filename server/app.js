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

const admin = require('firebase-admin');
var serviceAccount = require("./kartacmaoyunu-firebase-adminsdk-g40g9-8eb894efe6.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kartacmaoyunu.firebaseio.com"
  });
const GAME_SETTINGS = {
    themes:{
        nature:'DOĞA TEMA',
        random:"RATGELE TEMA",
        animal:"Hayvan TEMA"
    },
    themeFormat:'{gameTheme}/{id}.jpg',
    modes:{
        fast : 5,
        normal:10,
        slow:20
    },
    messages:{
        "game-started":{code:"1000",message:'Oyun başlıyor..'},
        "game-settings-not-valid":{code:'1001',message:"Oyun teması ya da modu sınırların dışında."}
    }
};

/*
(async function(){
    const idToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjUxMDM2YWYyZDgzOWE4NDJhZjQzY2VjZmJiZDU4YWYxYTc1OGVlYTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20va2FydGFjbWFveXVudSIsImF1ZCI6ImthcnRhY21hb3l1bnUiLCJhdXRoX3RpbWUiOjE1OTkyMTU3ODUsInVzZXJfaWQiOiJwdmRBZlg0b3NlYjVvaWZ3WTIxMERmT3VMeGkyIiwic3ViIjoicHZkQWZYNG9zZWI1b2lmd1kyMTBEZk91THhpMiIsImlhdCI6MTU5OTIyNDIxOSwiZXhwIjoxNTk5MjI3ODE5LCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidGVzdEB0ZXN0LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.MwdG-FPZu3UkZV_g6R8tDzqTSKvesSTPnadaCRoLcKsRfqewKwVRYRYMIfRjR8qrTbnCac1NCBIuznxHNCSaORxDpxeyskHaHG1JXde3r8IsUZS6W-uFg1fPLLWoUPx3Q_MVvTsRPR2m1yj-0veEhvrGpP3Sk6cvOTWW6MYDjUnSMVrlVZID1tK604qat15OK-eGGmtTgWwaWrC-g4tVsiqZ2yGh3nPwWgfH72uUCcyoxeZwDlcxzhkJTtAtZD3e-s9FhuEgRY_sAVaz3HpzL4MUq94H_AMVqDl-AV6XBiHXoefZylr7U6hSwuElyX8IXHxahSIDpsF3WRMrBArgkw";
    const id = "pvdAfX4oseb5oifwY210DfOuLxi2";


    const winnerRef = admin.firestore().collection('kullanicilar').doc(id);
    winnerRef.get().then(doc => {
        
        console.log(doc.data());
    });
   console.log('CHECKİNG',await CheckAuth(idToken,id))
    

      
})();

return;
*/


async function CheckAuth(auth,userid){
    
    return await admin.auth().verifyIdToken(auth)
    .then(function(decodedToken) {
        let uid = decodedToken.uid;
        return uid == userid;
    }).catch(function(error) {
        console.log(error);
        return false;
    });
}


let pending = [
    {
        user:{
            socket:null,
            id:'<userid>',
            fullname:'<fullname>',
            level:'<level>',
            avatar:'<avatar>',
        },
        gameTheme:'<gametheme>',
        gameMode:'<gamemod>'
    }
];

let gamesTEST = {
    '<gameid>':{
        gameId:'<gameid>',
        gameMode:'<gameMode>',
        gameTheme:'<gameTheme>',
        gameCreated:Date.now(),
        isStart:'<boolean>',///* is true when game started */
        isContinue:'<boolean>',///* match contionus */
        order:"<any-user-id>",///* formula : ~~(Math.random() * 2) */
        cards:[
            {img:'{gameTheme}/{id}.jpg',isOpen:'<boolean>'},/*< shuffle 10 times> */
        ],
        openCards:[
            '<there any card object>',
            '<there any card object but not previus>',
        ],
        targetScore:5,/* default over score */
        TIMER/*game builder*/:{
            interval:null,/** down counter for order */
            perMS:1000,/** REPEAT A PER SECOND - 1000 ms */
            maxsecond:'<selected gamemode (fast,normal,show)>',
            second:'<selected gameMode (fast , normal, show)'
        },
        turnCount:'<total turn>',
        users:{
            "<userid>":{
                auth:'<client-auth>',
                id:'<userid>',
                socket:'<socket>',
                fullname:'<fullname>',
                level:'<level>',
                avatar:'<avatar>',
                score:'<score>',
                requestCount:'<requestCount>',
                connected:'<true when comes in room>'
            },
            "<userid2>":{
                auth:'<client-auth>',
                id:'<userid>',
                socket:'<socket>',
                fullname:'<fullname>',
                level:'<level>',
                avatar:'<avatar>',
                score:'<score>',
                requestCount:'<requestCount>',
                connected:'<true when comes in room>'
            }
        }
    }

}
let games = {};

let onlineUsers = {};

io.on('connection', (socket) => {

    
    socket.on('init2',userid=>{
        onlineUsers[socket.id] = userid;
        socket.broadcast.emit('init2',Object.values(onlineUsers));
        socket.emit('init2',Object.values(onlineUsers));
    })
    
    socket.on('match-status-checking',user => {
        if(KULLANICI_OYUNDAMI(user.id)){
            socket.emit('match-status-checking',
            {isPlaying:KULLANICI_OYUNDAMI(user.id),gameID:OYUN_ID_GETIR(user.id)});
        }else{
            socket.emit('match-status-checking',
            {isPlaying:false});
        }
    });

    socket.on('matching',(user) => {
      
        if(OYUN_MOD_KONTROL(user.gameMode) && OYUN_TEMA_KONTROL(user.gameTheme)){
            user.user.socket = socket;
            BEKLEYENLERI_DENETLE(user);
        }else{
            // fatal error
            socket.emit('matching-error',GAME_SETTINGS.messages['game-settings-not-valid'])
        }
    });
    socket.on('matching-cancel',(user)=>{
        KULLANICI_BEKLEYENDEN_KALDIR(user.id);
    });

    socket.on('matching-gameid-control',(user)=>{

        const state = KULLANICI_OYUNODASINDA_MI(user.gameid,user.id);
        socket.emit("matcing-gameid-control",{state});
        if(state){
            const connectionstatus = KULLANICILAR_ODAYA_BAGLANDI_MI(user.gameid);
            if(connectionstatus){
                KULLANICI_ODAYA_BAGLANDI(user.id);
                io.sockets.in(user.gameid).emit("game started",
                {
                    order:games[user.gameid].order,
                    users:OYUN_KULLANICI_BILGILERI(user.gameid),
                    state:[GAME_SETTINGS.messages['game-started']],
                    opens:games[user.gameid].cards.filter(card =>{ 
                        if(card.isOpen){
                            return card.id
                        }
                    }) 
                });

                OYUN_BASLAT(user.gameid);
            }
                
        }
    });

    socket.on('game card turn',({user,cardId})=>{

        const gameID = OYUN_ID_GETIR(user.id);

        if(!gameID || !games[gameID]) return;


        if(games[gameID].isContinue && user.id == games[gameID].order){

            io.sockets.in(gameID)
                .emit('game card turn', 
                {error:false,cardId:cardId,card : games[gameID].cards[cardId] } );
            
            games[gameID].users[user.id].requestCount = games[gameID].users[user.id].requestCount + 1;
            games[gameID].openCards.push({
                img:games[gameID].cards[cardId].img,
                id:cardId
            });

            if(games[gameID].users[user.id].requestCount == 2){

                    games[gameID].turnCount = games[gameID].turnCount + 1;

                    const openCards = games[gameID].openCards;

                    if(openCards[openCards.length - 1].img == openCards[openCards.length - 2].img){
                        games[gameID].users[user.id].score = games[gameID].users[user.id].score + 1;
                        
                        io.sockets.in(gameID)
                        .emit('game card result',{state:true, won : user.id,users:OYUN_KULLANICI_BILGILERI(gameID)});

                        if(games[gameID].users[user.id].score == games[gameID].targetScore){

                            OYUN_BITIR(gameID,user.id);
                        }


                        games[gameID].openCards = [];
                    }else{
                        
                        io.sockets.in(gameID)
                                    .emit('game card result',
                                    {state:false,ids:games[gameID].openCards.map(card => card.id)});
                                    
                        if(games[gameID].TIMER.interval){
                            clearInterval(games[gameID].TIMER.interval);
                            games[gameID].TIMER.second = games[gameID].TIMER.maxsecond;
                        }

                        games[gameID].TIMER.interval = setInterval(function(){

                            if(games[gameID] == undefined){
                                return;
                            }else if(!games[gameID].isContinue){
                                clearInterval(games[gameID].TIMER.interval);
                                return;
                            }
                        
                          
                            io.sockets.in(gameID)
                            .emit('game timer',{second:games[gameID].TIMER.second});
                        
                            games[gameID].TIMER.second  = games[gameID].TIMER.second - 1;
                            
                            if(games[gameID].TIMER.second == 0){
    
                                if(games[gameID].users[games[gameID].order].requestCount == 1){
                                    
                                    games[gameID].users[games[gameID].order].requestCount = 0;
                                    io.sockets.in(gameID)
                                    .emit('game card result',{state:false,ids:[games[gameID].openCards[0].id]});
                                    
                                    
                                }
                            
                                games[gameID].order = Object.keys(games[gameID].users).find(guid=> guid != games[gameID].order);
                                games[gameID].TIMER.second = games[gameID].TIMER.maxsecond;
                                io.sockets.in(gameID).emit('game card turnchange',{order:games[gameID].order});
                                
                            }
    
    
                            
                        },1000);               


                    }/**#END else img equals */

                    
                    games[gameID].openCards = [];

                    games[gameID].users[user.id].requestCount = 0;
                    
                    games[gameID].order = Object.keys(games[gameID].users).find(guid=> guid != user.id);
                    
                    io.sockets.in(gameID).emit('game card turnchange',{order:games[gameID].order});
                    
                    

            }

            
        }else{
            io.sockets.in(gameID).emit('game card turn',{error:true});
        }

    });

    socket.on('game message',data=>{
        io.sockets.in(data.gameID).emit('game message',data.user);
    });

    socket.on('user leave',user => {
        KULLANICI_AYRILDI(user.gameID);
    });

 


    socket.broadcast.emit('online-alive',{alive:socket.client.conn.server.clientsCount})
    socket.emit('online-alive',{alive:socket.client.conn.server.clientsCount})
    socket.on('online-alive',()=>{
        socket.emit('online-alive',{alive:socket.client.conn.server.clientsCount})
    })
    socket.on('disconnect',()=>{
        socket.broadcast.emit('online-alive',{alive:socket.client.conn.server.clientsCount})
        
        delete onlineUsers[socket.id];
        socket.broadcast.emit('init2',Object.values(onlineUsers));
        socket.emit('init2',Object.values(onlineUsers));

        const gameid = SOCKET_ID_OYUN_GETIR(socket.id);
        if(gameid){
            KULLANICI_AYRILDI(gameid);
        }

    });


    

});

function KULLANICI_AYRILDI(gameID){
    if(games[gameID]){
        io.sockets.in(gameID).emit("user leave",1);     
       delete games[gameID];
    }
}

function BEKLEYENLERI_DENETLE(user){ 
    for(let i = 0 ;  i< pending.length;i++){
        if(pending[i].gameTheme == user.gameTheme && pending[i].gameMode == user.gameMode){
            YENI_OYUN_OLUSTUR(pending[i],user);
            return;
        } 
    }
    BEKLEYENLERE_KAYDET(user);
}
function KULLANICI_BEKLEYENDEN_KALDIR(userid){
    pending = pending.filter(p => p.user.id != userid);
}


function KULLANICI_OYUNDAMI(userid){
    return Object.keys(games).length > 0 && Object.values(games).some(game => game.users[userid] != undefined);
}
function KULLANICI_OYUNODASINDA_MI(gameid,userid){
    const getid = OYUN_ID_GETIR(userid);
    if(getid)
       if(getid == gameid){
            KULLANICI_ODAYA_BAGLANDI(userid);
            return true;
       } 
    
    return false;
}
function KULLANICILAR_ODAYA_BAGLANDI_MI(gameid){
    return Object.values(games[gameid].users).every(user => user.connected);
}
function KULLANICI_ODAYA_BAGLANDI(userid){
    const gameid = OYUN_ID_GETIR(userid);
    games[gameid].users[userid].connected = true;
}
function OYUN_KULLANICI_BILGILERI(gameid){
    let users = {};
    Object.keys(games[gameid].users).forEach(user => {
        users[user] = {
            id:games[gameid].users[user].id,
            avatar:games[gameid].users[user].avatar,
            level:games[gameid].users[user].level,
            fullname:games[gameid].users[user].fullname,
            score:games[gameid].users[user].score
        }
    });
    return users;
}
function OYUN_KULLANICI_GETIR(gameid,userid){
    return {
        auth:games[gameid].users[userid].auth,
        id:games[gameid].users[userid].id,
        fullname:games[gameid].users[userid].fullname,
        avatar:games[gameid].users[userid].avatar,
        level:games[gameid].users[userid].level,
        score:games[gameid].users[userid].score
    };
}
function SOCKET_ID_OYUN_GETIR(socketid){
    const find = Object.values(games).find(game => Object.values(game.users).some(user => user.socket.id == socketid ));
    if(find){
        return find;
    }
    return "";
}
function RAKIP_KULLANICI_BILGILERI(gameid,userid){
    const oppositeid = Object.keys(games[gameid].users).filter(user => user != userid);

    return {
        auth:games[gameid].users[oppositeid].auth,
        id:games[gameid].users[oppositeid].id,
        fullname:games[gameid].users[oppositeid].fullname,
        avatar:games[gameid].users[oppositeid].avatar,
        level:games[gameid].users[oppositeid].level,
        score:games[gameid].users[oppositeid].score
    };

}
function OYUN_ID_GETIR(userid){
    const find = Object.values(games).find(game => game.users[userid] != undefined);
    if(find){
        return find.gameId;
    }
    return "";
}
function BEKLEYENLERE_KAYDET(user){
    pending.push(user);
}
function YENI_OYUN_OLUSTUR(pendingUser,newUser){
    console.log('OYUN OLUSTU');
    // bekleyenlerden kulanıcıyı kaldır
    KULLANICI_BEKLEYENDEN_KALDIR(pendingUser.user.id);
    //pending = pending.filter(user => user.id != pendingUser.user.id);
    // yeni oda oluştur
    const TEMA_RESIMLERI = TEMA_RESIMLERI_GETIR(pendingUser.gameTheme);
    const MOD_SURESI = OYUN_MOD_SURESI(pendingUser.gameMode);
    const GAMEID = CREATE_GAME_ID();
    let template = {
        [GAMEID]:{
            gameId:GAMEID,
            gameMode:pendingUser.gameMode,
            gameTheme:pendingUser.gameTheme,
            gameCreated:Date.now(),
            isStart:false,
            isContinue:false,/* match contionus */
            order:ANY_USER_ID(pendingUser.user.id,newUser.user.id),
            cards:SHUFFLE(TEMA_RESIMLERI).concat(SHUFFLE(TEMA_RESIMLERI)),
            openCards:[],
            targetScore:5,/* default over score */
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

    games[GAMEID] = template[GAMEID];


    io.sockets.in(GAMEID).emit('matching join',{go:'/game/'.concat(GAMEID)});
}

function OYUN_BASLAT(gameid){
    games[gameid].isStart = true;
    games[gameid].isContinue = true;
}
async function OYUN_BITIR(gameid,userid){
    games[gameid].isContinue = false;
    
    const winner = OYUN_KULLANICI_GETIR(gameid,userid);
    const opposite = RAKIP_KULLANICI_BILGILERI(gameid,userid);
    io.sockets.in(gameid).emit('game over',{winner : winner });

    const winnerRef = admin.firestore().collection('kullanicilar').doc(winner.id);
    const oppositeRef = admin.firestore().collection('kullanicilar').doc(opposite.id);
    const puan = Math.abs(winner.score - opposite.score) * 100;

    if(await CheckAuth(winner.auth,winner.id)){
        //winner
       
        winnerRef.get().then(doc => {
            winnerRef.update({
                xp : doc.data().xp + puan
            })
        });

        admin.firestore().collection("maclar").add({
            kullaniciRef:winnerRef,
            durum:1,
            macsonuc:winner.score +" / "+opposite.score,
            rakipRef:oppositeRef,
            tarih:Date.now()
        });

    }


    if(await CheckAuth(opposite.auth,opposite.id)){
        
        oppositeRef.get().then(doc => {
            oppositeRef.update({
                xp : doc.data().xp + Math.floor(puan * 0.4)
            })
    
        });
    
        admin.firestore().collection("maclar").add({
            kullaniciRef:oppositeRef,
            durum:-1,
            macsonuc:opposite.score +" / "+winner.score,
            rakipRef:winnerRef,
            tarih:Date.now()
        });


    }




   
}


function TEMA_RESIMLERI_GETIR(tema){
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
                img:GAME_SETTINGS.themeFormat.replace(/{gameTheme}|{id}/gi, (matched) =>obj[matched]),
                isOpen:false
            }
        )
    }
    return images;
}
function OYUN_MOD_SURESI(mod){
    return GAME_SETTINGS.modes[mod];
}
function OYUN_TEMA_KONTROL(tema){
    if(GAME_SETTINGS.themes[tema])
        return true;
    return false;
}
function OYUN_MOD_KONTROL(mod){
    if(GAME_SETTINGS.modes[mod])
        return true;
    return false;
}



function ANY_USER_ID(u1,u2){
    if(~~(Math.random() * 2)){
        return u1;
    }
    return u2;
}

function SHUFFLE(items) {
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

function CREATE_GAME_ID(){
    const current_game_ids = Object.keys(games);
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
    if(trycount>times) return id.concat(randomInteger(1,9));
    return id;
}
function randomInteger(min,max){
    return Math.floor(Math.random() * (max-min)) + min;
}

http.listen(PORT,()=>console.log('bağlantı başarılı şekilde kuruldu port :'+PORT));