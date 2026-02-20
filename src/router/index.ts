import { createRouter, createWebHistory } from 'vue-router'
import Chat from '@/views/ChatView/ChatView.vue'
import Help from '@/views/HelpView/HelpView.vue'
import CharacterManagement from '@/views/CharacterView/CharacterManagement.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/chat'
        },
        {
            path: '/chat',
            name: 'chat',
            component: Chat
        },
        {
            path: '/characters',
            name: 'characters',
            component: CharacterManagement
        },
        {
            path: '/help',
            name: 'help',
            component: Help
        },
    ]
})

export default router
