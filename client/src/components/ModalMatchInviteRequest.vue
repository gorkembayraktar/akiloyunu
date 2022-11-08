<template>
  <v-row justify="center">
    <v-dialog v-bind:value="matchDialogInviteRequest" persistent max-width="600px">
    
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
                    <v-img :src="info.user.avatar"></v-img>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title class="body-2">{{info.user.fullname}}</v-list-item-title>
                    <v-list-item-subtitle>Seviye {{info.user.level}}</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-row>

              <v-col cols="12" sm="6" flat dense>
                  <span class="body-2">Oyun Teması :</span>
                  <span class="subtitle-1">{{themeName()}}</span>
              </v-col>
              <v-col cols="12" sm="6" flat dense>
                  <span class="subtitle-2">Oyun Modu : </span>
                  <span class="subtitle-1">{{modeName()}}</span>
              </v-col>
              
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeMatchDialog">Daveti reddet</v-btn>
          <v-btn color="success sdarken-1" @click="KabulEt">Daveti Kabul et</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>

  export default {
    name:'ModalMatch',
    props:["matchDialogInviteRequest","info"],
    data: () => ({
    }),
    methods:{
       
        KabulEt(){
            //this.$emit('matchDialogInvite',true);
            //this.closeMatchDialog();

            this.$socket.emit('match-invite-accept',{
                user:this.$store.state.user,
                invite_id:this.info.info.invite_id
            });
         
            this.closeMatchDialog();
           
        },
        closeMatchDialog(){
            this.$emit('matchDialogInviteRequest',false);
        },

        themeName(){
           const theme = this.$store.state.matchData.choice.theme.find(item => item.tag == this.info.info.theme);
           if(theme)
              return theme.name;
           return '';
        },
        modeName(){
           const mode = this.$store.state.matchData.choice.mode.find(item => item.tag == this.info.info.mode);
           if(mode)
              return mode.name;
           return '';
        }
    }
  }
</script>