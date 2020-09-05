<template>
  <v-layout row wrap >
        <v-flex fill-height d-flex xs12 md3 >
          <v-card justify-center color="blue-grey grey darken-4 py-12 px-12 "  width="100%" tile flat>
            
            <v-row 
                justify-content="center">

                <v-img
                    center
                    src="logo.png"
                    max-height="300"
                >
            </v-img>

            </v-row>
            <v-card-text class="white--text title text-center">GİRİŞ YAP</v-card-text>

                <v-col cols="12" justify-center>
                    <v-text-field
                        dark
                        light
                        label="Mail"
                        v-model="email"
                        placeholder="Mail adresini giriniz"
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

                <span class="red--text px-5">{{errorMessage}}</span>

                <v-btn
                    color="blue-grey"
                    class="ma-2 white--text"
                    block
                    @click="pressed"
                    >
                    Giriş yap
                    <v-icon right dark>mdi-login</v-icon>
                </v-btn>

                <v-btn
                    color="blue-dark"
                    class="white--text"
                    block
                    text
                    to="/register"
                    link
                    >
                    Yeni bir hesap oluştur.
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

export default {
    name:'Register',
    data(){
        return{
            email:'',
            password:'',
            errorMessage:'',
        }
    },
    methods:{
         async pressed(){
             
                try{
                    const auth = await firebase.auth().signInWithEmailAndPassword(this.email,this.password);
                    console.log(auth);
                   
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