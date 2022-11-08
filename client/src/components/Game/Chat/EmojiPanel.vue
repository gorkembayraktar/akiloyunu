<template>
     <v-card class="emojiPanel" dark v-if="emojiPanelShow">
                <div class="title">Emojiler</div>
                <div class="emoji-scroll">
                    <span v-for="(emoji,index) in emojis" @click="onEmojiClick(`${emoji.value}`)" v-bind:key="index">{{emoji.value}}</span>
                </div>
    </v-card>
</template>


<script>
export default {
    props:["emojiPanelShow"],
    data(){
        return{
            emojis:[],
        }
    },
    methods:{
        onEmojiClick(emoji){
            this.$emit('Click',emoji);
        },
    },
    created(){
      this.$http.get('https://raw.githubusercontent.com/shanraisshan/EmojiCodeSheet/master/json/string/People.json').then(response => {
        this.emojis = response.body.peoples.people;
      },null)
    },
}
</script>