<template>
  <v-layout row wrap >
        <v-flex fill-height d-flex xs12 md3 >
          <v-card justify-center color="blue-grey grey darken-4 py-12 px-12 "  width="100%" tile flat>
            
            <v-row 
                justify-content="center">

                <v-img
                    center
                    src=""
                    height="100"
                    width="100"
                >
            </v-img>

            </v-row>
            <v-card-text class="white--text title text-center">Kayıt ol</v-card-text>
             <span class="red--text px-5">{{errorMessage}}</span>
                <v-col cols="12" justify-center>
                    <v-text-field
                        dark
                        light
                        label="Mail"
                        placeholder="Mail adresini giriniz"
                        v-model="email"
                    ></v-text-field>
                </v-col>
                <v-col cols="12">
                    <v-text-field
                        dark
                        label="Şifre"
                        placeholder="şifrenizi giriniz"
                        type='password'
                        v-model="password"
                    ></v-text-field>
                </v-col>

                <v-btn
                    color="blue-grey"
                    class="ma-2 white--text"
                    block
                    @click="pressed"
                    >
                   Kayıt ol
                </v-btn>

                <v-btn
                    color="blue-dark"
                    class="white--text"
                    block
                    text
                    to="/login"
                    link
                    >
                    Giriş yap
                </v-btn>
           
          </v-card>
        </v-flex>

        <v-flex fill-height d-flex md9 class="d-xs-none">
         <v-card color="blue-grey darken-4" dark tile flat width="100%" style="background-image:url(login-shots.png)">
         </v-card>
        </v-flex>
    </v-layout>
</template>
<script>

import * as firebase from 'firebase/app';
import "firebase/auth"
import "firebase/database"

export default {
    name:'Register',
    data(){
        return{
            email:'',
            password:'',errorMessage:'',
        }
    },
    methods:{
         async pressed(){
             
                try{
                    await firebase.auth().createUserWithEmailAndPassword(this.email,this.password);
        
                    this.$router.push('/');
                }catch(err){
                      this.errorMessage = err.message;
                    console.log(err);
                }
        }
    }
}
</script>

<style lang="scss">

</style>