const http = require('http').createServer();
const io = require('socket.io')(http);

const PORT =  process.env.PORT || 3000;




const GAME_SETTINGS = {
    themes:{
        nature:'DOĞA TEMA'
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

let games = {
    '<gameid>':{
        gameId:'<gameid>',
        gameMode:'<gameMode>',
        gameTheme:'<gameTheme>',
        gameCreated:Date.now(),
        isStart:'<boolean>',/* is true when game started */
        isContinue:'<boolean>',/* match contionus */
        order:"<any-user-id>",/* formula : ~~(Math.random() * 2) */
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


io.on('connection', (socket) => {

    console.log(socket.id);
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

        if(OYUN_MOD_KONTROL(user.gameMod) && OYUN_TEMA_KONTROL(user.gameTheme)){
            user.socket = socket;
            BEKLEYENLERI_DENETLE(user);
        }else{
            // fatal error
            socket.emit('matching-error',GAME_SETTINGS.messages['game-settings-not-valid'])
        }
    });

    socket.on('matching-gameid-control',user=>{
        const state = KULLANICI_OYUNODASINDA_MI(user.gameid,user.id);
        socket.emit("matcing-gameid-control",{state});
        if(state){
            const connectionstatus = KULLANICILAR_ODAYA_BAGLANDI_MI(user.gameid);
            if(connectionstatus){
                io.sockets.in(user.gameid).emit("game started",
                {
                    order:games[user.gameid].order,
                    users:OYUN_KULLANICI_BILGILERI(user.gameid),
                    state:[GAME_SETTINGS.messages['game-started']] 
                });

                OYUN_BASLAT(user.gameId);
            }
                
        }
    });

    socket.on('game card turn',({user,cardId})=>{

        const gameID = OYUN_ID_GETIR(user.id);

        if(!gameID || !games[gameID]) return;


        if(games[gameID].isContinue && user.id == games[gameID].order){

            io.sockets.in(gameID)
                .emit('game card turn', 
                {error:false,cardId:cardId,card : games[gameID].cards[cardId-1] } );
            
            games[gameID].users[user.id].requestCount = games[gameID].users[user.id].requestCount + 1;
            games[gameID].openCards.push({
                img:games[gameID].cards[cardId - 1].img,
                id:cardId
            });

            if(games[gameID].user[user.id].requestCount == 2){

                    games[gameID].turnCount = games[gameID].turnCount + 1;

                    const openCards = games[gameID].openCards;

                    if(openCards[openCards.length - 1].img == openCards[openCards.length - 2].img){
                        games[gameID].users[user.id].score = games[gameID].users[user.id].score + 1;
                        
                        io.sockets.in(users[socket.id].roomid)
                        .emit('game card result',{state:true, won : user.id});

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

                                        if( !games[gameID].isContinue){
                                            clearInterval(games[gameID].TIMER.interval);
                                        }
                                    
                                      
                                        io.sockets.in(gameID)
                                        .emit('game timer',{second:games[gameID].TIMER.secon});
                                    
                                        games[gameID].TIMER.second  = games[gameID].TIMER.second - 1;
                                        
                                        if(games[gameID].TIMER.second == 0){

                                            if(games[gameID].users[user.id].requestCount == 1){
                                                clearInterval(games[gameID].TIMER.interval);
                                                games[gameID].users[user.id].requestCount = 0;
                                                io.sockets.in(gameID)
                                                .emit('game card result',{state:false,ids:[games[gameID].openCards[0].id]});
                                                
                                            }
                                        
                                            games[gameID].order = Object.keys(games[gameID].users).find(guid=> guid != user.id);
                                            games[gameID].TIMER.second = games[gameID].TIMER.maxsecond;
                                            io.sockets.in(gameID).emit('game card turnchange',{order:games[gameID].order});
                                            
                                        }
    

                                        
                                    },1000);


                    }/**#END else img equals */

                    games[gameID].users[user.id].requestCount = 0;
                    /**Sıra değiştir */
                    games[gameID].order = Object.keys(games[gameID].users).find(guid=> guid != user.id);

                    io.sockets.in(gameID).emit('game card turnchange',{order:games[gameID].order});

            }

            
        }else{
            io.sockets.in(game.id).emit('game card turn',{error:true});
        }

    });



 


    socket.broadcast.emit('online',{alive:socket.client.conn.server.clientsCount})
    socket.emit('online',{alive:socket.client.conn.server.clientsCount})
    socket.on('disconnect',()=>{
        socket.broadcast.emit('online',{alive:socket.client.conn.server.clientsCount})
    });


    

});

function BEKLEYENLERI_DENETLE(data){ 
    for(let i = 0 ;  i< pending.length;i++){
        if(pending[i].gameTheme == data.pendingTheme && pending[i].gameMod == data.gameMod){
            YENI_OYUN_OLUSTUR(pending[i],data);
            break;
        } 
    }
    BEKLEYENLERE_KAYDET(data);
}


function KULLANICI_OYUNDAMI(userid){
    return Object.keys(games).length > 0 && Object.values(games).some(game => game.users[userid] != undefined);
}
function KULLANICI_OYUNODASINDA_MI(gameid,userid){
    const getid = OYUN_ID_GETIR(userid);
    if(gameid)
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
    return Object.keys(games[gameid]).map(user => { 
        return {
            id:games[gameid].users[user].id,
            fullname:games[gameid].users[user].fullname,
            avatar:games[gameid].users[user].avatar,
            level:games[gameid].users[user].level
        }
    })
}
function OYUN_KULLANICI_GETIR(gameid,userid){
    return {
        id:games[gameid].users[userid].id,
        fullname:games[gameid].user[userid].fullname,
        avatar:games[gameid].user[userid].avatar,
        level:games[gameid].user[userid].level
    };
}
function SOCKET_ID_OYUN_GETIR(socketid){
    const find = Object.values(games).find(game => Object.keys(game.users).some(user => user.socket.id == socketid ));
    if(find){
        return find;
    }
    return "";
}
function RAKIP_KULLANICI_BILGILERI(gameid,userid){
    const rakip = games[gameid].users[userid];
    return Object.assign({},rakip,{
        user:{
            id:rakip.id,
            fullname:rakip.fullname,
            avatar:rakip.avatar,
            level:rakip.level
        }
    });
}
function OYUN_ID_GETIR(userid){
    const find = Object.values(games).find(game => game.users[userid] != undefined );
    if(find){
        return find.gameId;
    }
    return "";
}
function BEKLEYENLERE_KAYDET(data){
    pending.push(data);
}
function YENI_OYUN_OLUSTUR(pendingUser,newUser){
    // bekleyenlerden kulanıcıyı kaldır
    pending = pending.filter(user => user.id != pendingUser.user.id);
    // yeni oda oluştur
    const TEMA_RESIMLERI = TEMA_RESIMLERI_GETIR(pending.gameTheme);
    const MOD_SURESI = OYUN_MOD_SURESI(pending.gameMod);
    const GAMEID = CREATE_GAME_ID();
    let template = {
        [GAMEID]:{
            gameId:GAMEID,
            gameMode:pending.gameMode,
            gameTheme:pending.gameTheme,
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

    io.sockets.in(GAMEID).emit('matching join',{go:'/'.concat(GAMEID)});
}

function OYUN_BASLAT(gameid){
    games[gameid].isStart = true;
    games[gameid].isContinue = true;
}
function OYUN_BITIR(gameid,userid){
    games[gameid].isContinue = false;
    io.sockets.in(gameid).emit('game over',{winner : OYUN_KULLANICI_GETIR(gameid,userid) });
}


function TEMA_RESIMLERI_GETIR(tema){
    const times = 10;
    const obj = {
        gameTheme:tema,
        id:0
    };
    let images = [];
    for(let i = 1 ; i <= times;i++){
        obj.id = i;        
        images.push(
            {
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

function SHUFFLE(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
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