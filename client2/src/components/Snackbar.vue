<template>
  <div class="text-center ma-2">
   
    <v-snackbar
      v-model="Snackbar.show"
      color="success"
    >
      {{ Snackbar.text }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="Snackbar.show = false"
        >
          Kapat
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>


<script>
import { mapGetters } from 'vuex'
  export default {
    name:'ModalMatch',
     computed:{
      ...mapGetters([
        'Snackbar',
      ])
    }
  }
</script>