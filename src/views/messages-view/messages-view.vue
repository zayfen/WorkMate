<script setup lang="ts">
import ConversationList from '@/components/conversation-list/conversation-list.vue'
import ChatWindow from '@/components/chat-window/chat-window.vue'
import MessageInput from '@/components/message-input/message-input.vue'
</script>

<template>
  <div class="messages">
    <aside class="list">
      <ConversationList />
    </aside>
    <section class="chat">
      <ChatWindow />
      <MessageInput />
    </section>
  </div>
</template>

<style scoped>
.messages { display: grid; grid-template-columns: 280px 1fr; gap: 12px; height: calc(100vh - 140px) }
.list { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: auto }
.chat { display: grid; grid-template-rows: 1fr auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px }
</style>


