<template>
  <v-row justify="center">
    <v-dialog v-bind:value="matchDialogHasJoined" persistent max-width="300px">
    
      <v-card>
        <v-card-title>
          <span class="headline">
               <v-icon>mdi-info</v-icon>
                Aktif bir oyunun var  
            </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            Oyunu terket ya da devam et!
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Terket</v-btn>
          <v-btn color="blue darken-1" @click="closeDialog">Devam et</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
  export default {
    name:'ModalMatchHasJoined',
    props:["matchDialogHasJoined","user"],
    computed:{
    },
    created(){
      console.log();
    },
    methods:{
        closeDialog(){
          this.$socket.emit('user leave',{id:this.user.id,gameID:this.user.gameID})
          this.$emit('matchDialogHasJoined',false);
        }
    }
  }
</script>