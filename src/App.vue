<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import i18n from '@/locales/i18n'
import MomoIcon from './components/icons/IconMomo.vue'
import SettingIcon from './components/icons/IconSetting.vue'
import StudentIcon from './components/icons/IconStudent.vue'
import MessageIcon from './components/icons/IconMessage.vue'
import DownloadIcon from './components/icons/IconDownload.vue'
import ResetIcon from './components/icons/IconReset.vue'
import LanguageIcon from './components/icons/IconLanguage.vue'
import PlayerDialog from '@/views/DialogView/PlayerWindow.vue'
import SettingDialog from '@/views/DialogView/SettingWindow.vue'
import { download } from '@/assets/imgUtils/download'
import { store } from '@/assets/storeUtils/store'
import { talkHistory } from '@/assets/storeUtils/talkHistory'

store.getData()

const changeLanguage = async () => {
    const languageList = i18n.global.availableLocales
    const currentLngIdx = languageList.findIndex((ele) => ele === store.language)
    store.language = languageList[(currentLngIdx + 1) % languageList.length]
    i18n.global.locale = store.language as any
    store.setData()
}

const changeTheme = () => {
    if (store.theme !== 'momotalk' && store.theme !== 'yuzutalk') store.theme = 'momotalk'
    if (store.zoom < 0.5 || store.zoom > 1.5) store.zoom = 1
    const fullScreen = store.fullScreen ? 'full-screen' : 'not-full-screen'
    document.body.className = `${store.theme} ${fullScreen}`
    document.body.style.setProperty('--zoom', store.zoom.toString())
}
changeTheme()

document.onkeyup = (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        talkHistory.undo()
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        talkHistory.redo()
    }
}

let dpr = window.devicePixelRatio
const tryDownload = (ratioBase: number) => {
    const showZoomWarning = (ratio: number) => {
        const ans = i18n.global.t('warnZoom').replace('%ratio%', (ratio * 100).toFixed(0) + '%')
        return confirm(ans)
    }
    let ratio = 1
    let requiresWarning = false
    if (navigator.userAgent.includes('WebKit')) {
        ratio = window.outerWidth / window.innerWidth
        requiresWarning = Math.abs(ratio - 1) > 0.05
    } else {
        ratio = window.devicePixelRatio
        requiresWarning = ratio !== ratioBase
    }
    if (requiresWarning && !showZoomWarning(ratio)) return
    download()
}

let vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)
window.addEventListener('resize', () => {
    vh = window.innerHeight * 0.01
    dpr = window.devicePixelRatio
    document.documentElement.style.setProperty('--vh', `${vh}px`)
})
</script>

<template>
    <PlayerDialog />
    <SettingDialog />
    <div id="root">
        <header id="header" role="banner">
            <div id="header__left">
                <MomoIcon class="icon momo" />
                <span id="header__title">MomoTalk</span>
            </div>
            <div id="header__right">
                <RouterLink to="/help">
                    <button class="help">?</button>
                </RouterLink>
                <SettingIcon class="icon setting" @click="store.showSettingDialog = true" />
            </div>
        </header>

        <nav id="sidebar" role="navigation">
            <div id="sidebar__up">
                <RouterLink to="/chat" title="Chat">
                    <MessageIcon class="icon message" />
                </RouterLink>
                <RouterLink to="/characters" title="Character Management">
                    <StudentIcon class="icon info" />
                </RouterLink>
            </div>
            <div id="sidebar__down">
                <div style="cursor: pointer" @click="store.resetData()" title="Reset">
                    <ResetIcon class="icon reset" />
                </div>
                <div style="cursor: pointer" @click="tryDownload(dpr)" title="Download">
                    <DownloadIcon class="icon download" />
                </div>
                <div style="cursor: pointer" @click="changeLanguage" title="Switch Language">
                    <LanguageIcon class="icon language" />
                </div>
            </div>
        </nav>

        <main id="maincard">
            <RouterView />
        </main>
    </div>
</template>

<style scoped lang="scss">
@import './app.scss';
@import '@/assets/css/icons.scss';
</style>
