<template>
  <v-row justify="center">
    <v-dialog v-bind:value="modal.open" persistent max-width="300px">
    
      <v-card>
        <v-card-title>
          <span class="headline">
               <v-icon>{{modal.icon}}</v-icon>
                {{modal.title}}  
            </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            {{ modal.content }}
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDialog">Kapat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
  export default {
    name:'ModalMatch',
    computed:{
      modal(){
        return this.$store.getters.mainModalParams;
      }
    },
    created(){
      console.log();
    },
    methods:{
        closeDialog(){
          this.$store.commit('mainModalClose');
        }
    }
  }
</script>