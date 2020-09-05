<template>
    <div>

         <div class="message" v-for="(message,index) in messages" v-bind:key="index" :class="{own: message.id == userid}">
                <div class="username" v-if="index == 0">{{message.fullname}}</div>
                <div class="username" v-if="index>0 && messages[index-1].id != message.id">{{message.fullname}}</div>
                <div style="margin-top: 5px"></div>
                <div class="content">
                    <div>{{message.content}}</div>
                </div>
        </div>

        

    </div>
</template>

<script>

export default {
    name:'Messages',
    props:[
        "messages",
        "userid"
    ],
    data(){
        return {

        }
    }
}
</script>