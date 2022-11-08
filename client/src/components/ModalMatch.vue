<template>
  <v-row justify="center">
    <v-dialog v-bind:value="matchDialog" persistent max-width="600px">
    
      <v-card>
        <v-card-title>
          <span class="headline">Karşılaşma Ara</span>
        </v-card-title>
        <v-card-text>
          <v-container>
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
          <v-btn color="success sdarken-1" @click="Start">Karşılaşma Aramayı başlat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
  export default {
    name:'ModalMatch',
    props:["matchDialog"],
    data(){
      return {
        themeItems:this.$store.state.matchData.choice.theme,
        modeItems:this.$store.state.matchData.choice.mode,
        selectedTheme:"",
        selectedMode:"",
      }
    },
    sockets:{
      ["matching-error"](err){
        console.log(err);
        this.$emit('matchDialogLoader',false);
      
      },
      ["matching join"](res){
        this.$router.push(res.go);
      }
    },
    methods:{
        Start(){
          if(this.selectedMode && this.selectedTheme){
              this.$emit('matchDialogLoader',true);
              this.$emit('matchDialog',false);
              const params = {
                gameTheme:this.selectedTheme,
                gameMode:this.selectedMode,
                user:this.$store.getters.UserProfile
              }
              this.$socket.emit('matching',params);
          }
        },
        closeMatchDialog(){
            this.$socket.emit('matching-cancel',this.$store.state.user.id)
            this.$emit('matchDialog',false);
        }
    }
  }
</script>