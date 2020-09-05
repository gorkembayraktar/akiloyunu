<template>
     <v-card>

          <v-form
          ref="form"
          lazy-validation
          class="px-5 py-5"
          style="max-width:500px;">
          
          <v-row>
            
         
              <v-avatar color="blue mr-1 text-xs-center" size="100">
                  <v-img 
                  :src="url" />
                </v-avatar>
            <v-col>

                <v-file-input
                accept="image/png, image/jpeg, image/bmp"
                placeholder="Pick an avatar"
                prepend-icon="mdi-camera"
                label="Avatar"
                @change="UploadImage"
                
              ></v-file-input>
            </v-col>
          </v-row>
        
          <v-text-field
            v-model="name"
            label="İsminiz"

          ></v-text-field>

          <v-text-field
            v-bind:value="email"
            label="E-mail"
            disabled
           

          ></v-text-field>
          <v-btn
           small
            color="success"
            @click="update"
          >
          Bilgilerimi Güncelle
          </v-btn>

         
        </v-form>
             
    </v-card>

</template>

<script>

export default {
    data(){
        return{
          name:'',
          email:'',
          url:'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png'

        }
    },
    methods:{
      update(){
         this.$store.commit('UpdateFullName',this.name);
      },
      UploadImage(){
        
      

      }
    },
    created(){
      this.name = this.$store.getters.UserFullName;
      this.email = this.$store.state.user.email;
    },
    computed:{
         headers(){
             return this.$store.getters.matchDataHeaders;
         },
         desserts(){
              return this.$store.getters.matchDataDesserts;
         },
    }
}
</script>