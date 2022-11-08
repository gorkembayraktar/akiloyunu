<template>
  <v-row justify="center">
    <v-dialog v-bind:value="matchDialogLoader" persistent max-width="300px">
    
      <v-card>
        <v-card-title>
          <span class="headline">Karşılaşma Aranıyor ..</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row class="justify-center">
              
                <v-progress-circular
                indeterminate
                color="primary"
                size="50"
                width="6"
                ></v-progress-circular>
             
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions class="justify-center">
         
          <v-btn color="red darken-4" class="white--text" @click="closeMatchDialog">Karşılaşma iptal et</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
  export default {
    name:'ModalMatch',
    props:["matchDialogLoader"],
    data(){
      return {           
        warningAudio:new Audio(this.$store.state.sounds.warning)
      }
    },
    watch:{
       matchDialogLoader(prop){
         if(prop){
           this.warningAudio.play();
         }else{
           this.warningAudio.pause();
         }
       }
    },
    methods:{
        closeMatchDialog(){
      
            this.$emit('matchDialogLoader',false);
        }
    }
  }
</script>