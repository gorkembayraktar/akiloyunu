<template>
     <v-card>
              <v-data-table
                :headers="headers"
                :items="desserts"
                :items-per-page="10"
                class="elevation-1"
              >
                  <template v-slot:item.avatar="{ item }">
                    <v-avatar size="35">
                    <v-img  :src="item.avatar" />
                    </v-avatar>
                  </template>
                  <template v-slot:item.kazandin="{ item }">
                    <v-chip class="white--text" small :color="`${item.kazandin ? 'green' : 'red'}`">{{item.kazandin ? 'Kazandın' : 'Kaybettin '}}</v-chip>
                  </template>
              </v-data-table>
            </v-card>

</template>


<script>
export default {
    data(){
        return{

        }
    },
    computed:{
         headers(){
             return this.$store.getters.matchDataHeaders;
         },
         desserts(){
              return this.$store.getters.matchDataDesserts;
         }
    }
}
</script>