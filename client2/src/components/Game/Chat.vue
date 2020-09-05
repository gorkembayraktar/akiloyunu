<template>
    <v-navigation-drawer app dark right v-bind:value="drawer">
        <v-list>
          <v-row class="ma-2 mb-5">
            <v-toolbar-title class="text-center">
            <v-icon class="mx-4">mdi-forum-outline</v-icon>
              <span class="title">Sohbet</span>
            </v-toolbar-title>
          </v-row>
          <v-divider />
          <v-list-item>
            <v-list-item-avatar color="grey">
                <v-img :src="opponent.avatar"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
                <v-list-item-title class="body-2">{{opponent.fullname}}</v-list-item-title>
                <v-list-item-subtitle>Level {{opponent.level}}</v-list-item-subtitle>
            </v-list-item-content>
            </v-list-item>

            <v-divider />

           

            <div class="chat-container scrollable"  ref="chatContainer" >
    
               <Messages :userid="user.id" :messages="messages" />

              
            </div>
          


           
           <div class="typer">
                <v-text-field
                    placeholder="Birşeyler yaz"
                    v-model="content"
                    class="p-1"
                    @keydown="inputMessage"
                    @click="emojiPanelShow = false"
                ></v-text-field>
              
                <v-btn icon class="blue--text emoji-panel" @click="toggleEmojiPanel">
                    <v-icon>mdi-emoticon-outline</v-icon>
                </v-btn>
    
            </div>
            <EmojiPanel :emojiPanelShow="emojiPanelShow" @Click="onEmojiClick"/>
         
                   
               
         
        </v-list>

      </v-navigation-drawer>
</template>


<script>

import Messages from '@/components/Game/Chat/Messages'
import EmojiPanel from '@/components/Game/Chat/EmojiPanel'

export default {
  name: 'App',
  props:["drawer","opponent","user"],
  components:{
      Messages,
      EmojiPanel
  },
  data(){
    return {
        emojiPanelShow:false,
        content:'',
        messages:[]
    }
  },
  sockets:{
    ["game message"](data){
      this.messages.push(data)
       this.scrollDown();
    }
  },
  methods:{
    toggleEmojiPanel(){
        this.emojiPanelShow = !this.emojiPanelShow;
    },
    inputMessage(e){
       if(e.keyCode == 13){
           this.sendMessage();
       }
    },
    onEmojiClick(value){
        this.content += value;
    },
    sendMessage(){
        this.$socket.emit('game message',{gameID:this.user.gameID,user:{id:this.user.id,fullname:this.user.fullname,content:this.content}})
        this.content = '';
       
    },
    scrollDown(){
        setTimeout(()=>{

            this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight - this.$refs.chatContainer.clientHeight;
        },33);
    }
  }
};
</script>



<style lang="scss">
body{
    background-color:#18191a;
    scroll-behavior: smooth;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;

}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.scrollable {
    overflow-y: auto;
    height: 70vh;
  }
.chat-container{
    position:relative;
    padding:10px;
}
.emojiPanel{
    padding:8px;
    bottom:100px;
    position:absolute;
    width:100%;
    height:200px;
    z-index:999;
    user-select:none;
    .emoji-scroll{
        overflow-y: auto;
        height:200px;
    }
    span{cursor:pointer;}
}

.typer{
    position:absolute;
    justify-content: center;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    bottom: 0;
    height: 4.9rem;
    width: 100%;
    box-shadow: 0 -5px 10px -5px rgba(0,0,0,.2);
    padding: 0 20px;
  }
  .message{
    margin-bottom: 3px;
  }
  .message.own{
    text-align: right;
  }
  .content{
    padding: 8px;
    background-color: lightgreen;
    border-radius: 10px;
    display:inline-block;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.2), 0 1px 1px 0 rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12);
    max-width: 50%;
    word-wrap: break-word;
  }
  .message.own .content{
    background-color: lightskyblue;
  }
  .chat-container .username{
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    padding:0 6px;
  }
</style>