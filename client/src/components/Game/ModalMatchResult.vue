<template>
  <v-row justify="center">
    <v-dialog v-bind:value="matchResult" persistent max-width="300px">
    
      <v-card>
        <v-card-title>
          <span class="headline">
               <v-icon>mdi-info</v-icon>
                {{  win ? 'Oyunu kazandın': 'Oyunu kaybettin' }}
            </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" @click="closeDialog">Anasayfa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
  export default {
    name:'ModalMatchResult',
    props:["matchResult","win"],
    methods:{
        closeDialog(){
            this.$router.push('/');
        }
    }
  }
</script>