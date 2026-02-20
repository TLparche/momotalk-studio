import { reactive } from 'vue'
import i18n from '@/locales/i18n'
import { talkHistory } from './talkHistory'
import { selectList } from './selectList'
import { characterManager } from './characterManager'

export const store = reactive({
    language: 'kr',
    theme: 'momotalk',
    fullScreen: false,
    zoom: 1,
    draggable: window.matchMedia('(max-width: 1150px)').matches,
    chatBackground: '#ffffff',

    typing: 0,
    text: '',
    insertId: -1,
    showPlayerDialog: false,
    showSettingDialog: false,
    storyKey: '10005',
    storyList: {} as Record<string, string>,
    storyFile: '1000501',

    setData() {
        talkHistory.setData()
        selectList.setData()
        characterManager.setData()
        localStorage.setItem('language', JSON.stringify(this.language))
        localStorage.setItem('render-theme', JSON.stringify(this.theme))
        localStorage.setItem('draggable', JSON.stringify(this.draggable))
        localStorage.setItem('full-screen', JSON.stringify(this.fullScreen))
        localStorage.setItem('zoom', JSON.stringify(this.zoom))
        localStorage.setItem('chat-background', JSON.stringify(this.chatBackground))
    },
    getData() {
        talkHistory.getData()
        selectList.getData()
        characterManager.getData()
        const data = ['language', 'render-theme', 'draggable', 'full-screen', 'zoom']
            .map((x) => localStorage.getItem(x))
        this.language  = data[0] != null ? JSON.parse(data[0]) : 'kr'
        i18n.global.locale = this.language as any
        this.theme     = data[1] != null ? JSON.parse(data[1]) : 'momotalk'
        this.draggable = data[2] != null ? JSON.parse(data[2]) : window.matchMedia('(max-width: 1150px)').matches
        this.fullScreen = data[3] != null ? JSON.parse(data[3]) : false
        this.zoom      = data[4] != null ? JSON.parse(data[4]) : 1
        const chatBackground = localStorage.getItem('chat-background')
        this.chatBackground = chatBackground != null ? JSON.parse(chatBackground) : '#ffffff'
    },
    resetData() {
        talkHistory.resetData()
        selectList.resetData()
        this.setData()
    },
    resetInitData() {
        ;[
            'talkHistory',
            'talkId',
            'selectHistory',
            'customCharacters',
            'language',
            'render-theme',
            'draggable',
            'full-screen',
            'zoom',
            'chat-background'
        ].forEach((key) => localStorage.removeItem(key))

        talkHistory.resetData()
        selectList.resetData()
        characterManager.resetData()

        this.language = 'kr'
        i18n.global.locale = 'kr' as any
        this.theme = 'momotalk'
        this.draggable = window.matchMedia('(max-width: 1150px)').matches
        this.fullScreen = false
        this.zoom = 1
        this.chatBackground = '#ffffff'
        this.typing = 0
        this.text = ''
        this.insertId = -1
        this.showPlayerDialog = false
        this.showSettingDialog = false
        this.storyKey = '10005'
        this.storyList = {}
        this.storyFile = '1000501'

        this.setData()
    }
})
