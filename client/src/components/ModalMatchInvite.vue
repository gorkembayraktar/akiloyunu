<template>
  <v-row justify="center">
    <v-dialog v-bind:value="matchDialogInvite" persistent max-width="600px">
    
      <v-card>
        <v-card-title>
          <span class="headline">
               <v-icon>mdi-sword-cross</v-icon>
              Oyun Daveti</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid>

              <v-list-item>
                <v-list-item-avatar color="grey">
                    <v-img :src="user.avatar"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title class="body-2">{{user.fullname}}</v-list-item-title>
                    <v-list-item-subtitle>Seviye {{user.level}} </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-row>
              
              <v-col cols="12" sm="6">
                <v-select
                  :items="themeItems"
                  item-text="name"
                  item-value="tag"
                  v-model="selectedTheme"
                  label="Oyun Teması"
                  required
                ></v-select>
                <small>Kartların üzerindeki resimler</small>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  :items="modeItems"
                  item-text="name"
                  v-model="selectedMode"
                  item-value="tag"
                  label="Oyun Modu"
                  required
                ></v-select>
                <small>Hamle süresi</small>
              </v-col>
             
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeMatchDialog">Vazgeç</v-btn>
          <v-btn color="success sdarken-1" @click="Start">Davet Gönder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import { mapActions } from 'vuex';
  export default {
    name:'ModalMatch',
    props:["matchDialogInvite","user"],
    data(){
      return {
        themeItems:this.$store.state.matchData.choice.theme,
        modeItems:this.$store.state.matchData.choice.mode,
        selectedTheme:"",
        selectedMode:"",
      }
    },
    methods:{
       ...mapActions([
        'Snackbar'
        ]),
        Start(){
          if(this.selectedMode && this.selectedTheme){
              // davet gönder,

              this.$socket.emit('match-invite',{
                  from:this.$store.state.user,
                  to:this.user,
                  info:{
                    theme:this.selectedTheme,
                    mode:this.selectedMode
                  }
              });
              this.closeMatchDialog();
              this.Snackbar("Davet gönderildi!");
          }
            
            //this.closeMatchDialog();
        },
        closeMatchDialog(){
            this.$emit('matchDialogInvite',false);
        }
    }
  }
</script>