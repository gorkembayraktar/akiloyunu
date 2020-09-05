<template>
    <v-row justify="center">
    <v-dialog v-bind:value="mainQuestionDialog" persistent max-width="500px">
    
      <v-card>
        <v-card-title>
          <span class="headline">Karşılaşmadan Kaçış</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <span>Karşılaşmadan kaçtığın için puan kaybedeceksin.</span>
          </v-container>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="blue darken-1" text @click="closeEscapeDialog">Vazgeç</v-btn>
          <v-btn color="red darken-4" class="white--text" @click="escapeMatch">Evet kaçmak istiyorum</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>


</template>

<script>
  export default {
    name:'ModalMainQuestion',
    props:["mainQuestionDialog"],
    data: () => ({
    }),

    created(){
        const vm = this;
        document.body.onkeydown = (e) => {
            if(e.keyCode == 27){ // press ESC
                vm.$emit('mainQuestionDialog',!vm.mainQuestionDialog);
            }
      
        }
    },
    methods:{
        closeEscapeDialog(){
            this.$emit('mainQuestionDialog',false);
        },
        openEscapeDialog(){
            this.$emit('mainQuestionDialog',true);
        },
        escapeMatch(){
            this.$emit('escapeMatch');
        }
    }
  }
</script>