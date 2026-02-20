<template>
    <main class="chat-editor">
        <aside class="character-panel">
            <section class="panel-block">
                <h3>Send As</h3>
                <div class="sender-list">
                    <button :class="{ active: selected === 1 }" @click="selectChar(1)" title="Sensei">
                        <ProfileIcon class="icon profile" />
                    </button>
                    <button :class="{ active: selected === 2 }" @click="selectChar(2)" title="Story Event">
                        <HeartIcon class="heart icon" />
                    </button>
                    <button :class="{ active: selected === 3 }" @click="selectChar(3)" title="Reply">
                        <ChoiceIcon class="choice icon" />
                    </button>
                    <button :class="{ active: selected === 4 }" @click="selectChar(4)" title="System Message">
                        <BellIcon class="heart bell" />
                    </button>
                </div>
            </section>

            <section class="panel-block">
                <h3>Selected Characters</h3>
                <div class="selected-characters">
                    <div
                        class="selected-item"
                        :class="{ active: selected === student }"
                        v-for="student in selectList.selectList"
                        :key="student.Id"
                    >
                        <img :src="student.Avatar" @click="selectChar(student)" />
                        <div class="selected-item__meta">
                            <span>{{ student.Name }}</span>
                            <button v-if="student.Faces && student.Faces.length > 1" @click="cycleFace(student)">
                                Face
                            </button>
                        </div>
                        <CloseIcon class="delete-button" @click="deleteStudent(student.Id)" />
                    </div>
                </div>
            </section>

            <section class="panel-block">
                <h3>Character List</h3>
                <input
                    class="character-search"
                    type="text"
                    v-model="librarySearch"
                    placeholder="Search characters"
                />
                <div class="library-list">
                    <div v-if="filteredStudents.length === 0 && characterManager.characters.length === 0" class="library-empty">
                        No characters loaded. Check network or add custom characters.
                    </div>
                    <button
                        class="library-item"
                        v-for="student in filteredStudents"
                        :key="student.Id"
                        @click="addStudentFromLibrary(student)"
                    >
                        <img :src="student.Avatars[0]" />
                        <span>{{ student.Name }}</span>
                    </button>
                    <div class="custom-library" v-for="custom in characterManager.characters" :key="custom.id">
                        <header>{{ custom.name }}</header>
                        <div class="custom-library__faces">
                            <button
                                v-for="(face, faceIndex) in custom.faces"
                                :key="`${custom.id}-${faceIndex}`"
                                @click="addManagedFace(custom.id, custom.name, face, custom.faces)"
                            >
                                <img :src="face" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="panel-block panel-actions">
                <h3>Chat Settings</h3>
                <label>
                    Background
                    <input type="color" :value="store.chatBackground" @input="updateChatBackground($event)" />
                </label>
                <div class="file-buttons">
                    <button @click="exportJson">Export JSON</button>
                    <button @click="importJson">Import JSON</button>
                </div>
            </section>

            <section class="panel-block" v-if="selectedTalk">
                <h3>Selected Block Style</h3>
                <label>
                    Font
                    <select
                        :value="selectedTalk.style?.fontFamily || 'Blueaka, sans-serif'"
                        @change="updateTalkStyle({ fontFamily: ($event.target as HTMLSelectElement).value })"
                    >
                        <option value="Blueaka, sans-serif">Blueaka</option>
                        <option value="Nunito, sans-serif">Nunito</option>
                        <option value="'Noto Sans', sans-serif">Noto Sans</option>
                    </select>
                </label>
                <label>
                    Font Size
                    <input
                        type="range"
                        min="12"
                        max="40"
                        :value="selectedTalk.style?.fontSize || 20"
                        @input="updateTalkStyle({ fontSize: Number(($event.target as HTMLInputElement).value) })"
                    />
                </label>
                <label>
                    Font Weight
                    <input
                        type="range"
                        min="200"
                        max="900"
                        step="100"
                        :value="selectedTalk.style?.fontWeight || 600"
                        @input="updateTalkStyle({ fontWeight: Number(($event.target as HTMLInputElement).value) })"
                    />
                </label>
                <label>
                    Alignment
                    <select
                        :value="selectedTalk.style?.textAlign || 'left'"
                        @change="updateTalkStyle({ textAlign: ($event.target as HTMLSelectElement).value as any })"
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </label>
                <label>
                    Text Color
                    <input
                        type="color"
                        :value="selectedTalk.style?.color || '#2a323e'"
                        @input="updateTalkStyle({ color: ($event.target as HTMLInputElement).value })"
                    />
                </label>
                <label v-if="selectedTalkIsImage">
                    Image Size
                    <input
                        type="range"
                        min="20"
                        max="100"
                        :value="selectedTalk.style?.imageWidth || 100"
                        @input="updateTalkStyle({ imageWidth: Number(($event.target as HTMLInputElement).value) })"
                    />
                </label>
            </section>
        </aside>

        <section class="chat-panel">
            <div class="talk-list show-action" id="talkList" :style="{ backgroundColor: store.chatBackground }">
                <chat-draggable
                    :tasks="talkHistory.talkHistory"
                    :selected-talk-id="selectedTalkId"
                    @select-talk="onSelectTalk"
                />
            </div>

            <div class="add" id="sendBar">
                <div class="input-bar">
                    <Popper placement="top" offset-distance="0">
                        <div class="sticker" id="sticker">
                            <div v-if="selected === 1" title="Send a Sticker">
                                <ProfileIcon class="icon profile" />
                            </div>
                            <div v-else-if="selected === 2">
                                <HeartIcon class="heart icon" />
                            </div>
                            <div v-else-if="selected === 3">
                                <ChoiceIcon class="choice icon" />
                            </div>
                            <div v-else-if="selected === 4">
                                <BellIcon class="heart bell" />
                            </div>
                            <div v-else-if="typeof selected != 'number'" style="padding: 0px; margin: 0px" class="item">
                                <img :src="selected.Avatar" />
                            </div>
                        </div>
                        <template #content>
                            <div class="sticker-wrapper" v-if="typeof selected !== 'number' || selected === 1">
                                <div class="stk">
                                    <div v-for="(sticker, index) in stickerList" :key="index">
                                        <img :src="sticker" @click="_sticker(sticker)" />
                                    </div>
                                </div>
                                <div class="tab">
                                    <div @click="switchSticker(-1)" :class="{ stk__active: stickerTab === 1 }">1</div>
                                    <div @click="switchSticker(selected)" :class="{ stk__active: stickerTab === 2 }">2</div>
                                </div>
                            </div>
                        </template>
                    </Popper>

                    <textarea class="text" placeholder="Aa" v-model="store.text" id="textarea"></textarea>
                    <div class="photo" title="Send an Image">
                        <ImageIcon @click="_image()" class="image icon" />
                    </div>
                    <div class="message" title="Send the Message">
                        <SendIcon @click="_text()" class="send icon" />
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Popper from 'vue3-popper'

import ProfileIcon from '@/components/icons/IconProfile.vue'
import SendIcon from '@/components/icons/IconSend.vue'
import ImageIcon from '@/components/icons/IconImage.vue'
import CloseIcon from '@/components/icons/IconClose2.vue'
import HeartIcon from '@/components/icons/IconHeart.vue'
import BellIcon from '@/components/icons/IconBell.vue'
import ChoiceIcon from '@/components/icons/IconChoice.vue'

import ChatDraggable from '@/views/ChatView/ChatDraggable.vue'
import { baseStudent, studentInfo, Talk, TalkStyle } from '@/assets/requestUtils/interface'
import { stickers, stickers2, stickers3 } from '@/assets/utils/stickers'
import { getMessage, getStickers, getStudents, proxy } from '@/assets/requestUtils/request'
import { store } from '@/assets/storeUtils/store'
import { talkHistory } from '@/assets/storeUtils/talkHistory'
import { selectList } from '@/assets/storeUtils/selectList'
import { characterManager } from '@/assets/storeUtils/characterManager'
import { sendText, sendImage, sendSticker } from '@/assets/chatUtils/send'
import { insertImage, insertSticker, insertText } from '@/assets/chatUtils/insert'
import { exportJson, importJson } from '@/assets/storeUtils/file'
import { search } from '@/assets/utils/search'

const selected = ref<baseStudent | number>(1)
const selectedTalkId = ref<number>(-1)
const librarySearch = ref('')
const students = ref<studentInfo[]>([])

const loadStudents = async () => {
    try {
        students.value = await getStudents(store.language)
        const studentMap = new Map(students.value.map((student) => [student.Id, student]))
        let changed = false

        selectList.selectList = selectList.selectList.map((item) => {
            const matched = studentMap.get(item.Id)
            if (!matched) return item

            const nextAvatar = matched.Avatars[matched.cnt]
            const nextFaces = [...matched.Avatars]
            if (item.Avatar !== nextAvatar || JSON.stringify(item.Faces || []) !== JSON.stringify(nextFaces)) {
                changed = true
                return {
                    ...item,
                    Avatar: nextAvatar,
                    Faces: nextFaces
                }
            }
            return item
        })

        if (changed) selectList.setData()
    } catch (_error) {
        students.value = []
    }
}

const filteredStudents = computed(() => search(students.value, librarySearch.value).slice(0, 100))
const selectedTalk = computed<Talk | null>(() => {
    const index = talkHistory.getTalkIndexById(selectedTalkId.value)
    return index === -1 ? null : talkHistory.talkHistory[index]
})

const selectedTalkIsImage = computed(() => {
    if (!selectedTalk.value) return false
    const suffix = `(bmp|jpg|png|tif|gif|svg|webp|jpeg)`
    const regular = new RegExp(`(data:image.*)|((http|https)://.*.${suffix})`)
    return regular.test(selectedTalk.value.content)
})

const selectChar = (student: baseStudent | number) => {
    selected.value = student
    switchSticker(-1)
}

const addStudentFromLibrary = (student: studentInfo) => {
    const selectedStudent: baseStudent = {
        Id: student.Id,
        Name: student.Name,
        Avatar: student.Avatars[student.cnt],
        Faces: [...student.Avatars]
    }
    selectList.pushStudent(selectedStudent)
    selectChar(selectList.selectList[0])
}

const addManagedFace = (id: number, name: string, avatar: string, faces: string[]) => {
    const custom: baseStudent = {
        Id: id,
        Name: name,
        Avatar: avatar,
        Faces: [...faces]
    }
    selectList.pushStudent(custom)
    selectChar(selectList.selectList[0])
}

const cycleFace = (student: baseStudent) => {
    if (!student.Faces || student.Faces.length <= 1) return
    const currentIndex = student.Faces.indexOf(student.Avatar)
    const nextFace = student.Faces[(currentIndex + 1) % student.Faces.length]
    student.Avatar = nextFace
    selectList.setData()
    if (typeof selected.value !== 'number' && selected.value.Id === student.Id) {
        selected.value = student
    }
}

const deleteStudent = (id: number) => {
    selectList.deleteStudent(id)
    selectChar(1)
}

const updateChatBackground = (event: Event) => {
    store.chatBackground = (event.target as HTMLInputElement).value
    store.setData()
}

const updateTalkStyle = (patch: Partial<TalkStyle>) => {
    if (!selectedTalk.value) return
    const latest = {
        ...selectedTalk.value.style,
        ...patch
    }
    talkHistory.setTalkStyle(selectedTalk.value.Id, latest)
}

const onSelectTalk = (talk: Talk) => {
    selectedTalkId.value = talk.Id
}

const _text = () => {
    store.insertId === -1
        ? sendText(selected.value, store.text)
        : insertText(selected.value, store.text, store.insertId)
}
const _image = () => {
    store.insertId === -1
        ? sendImage(selected.value)
        : insertImage(selected.value, store.insertId)
}
const _sticker = (sticker: string) => {
    store.insertId === -1
        ? sendSticker(selected.value, sticker)
        : insertSticker(selected.value, sticker, store.insertId)
}

const stickerList = ref<string[]>(proxy(stickers))
const stickerTab = ref<number>(1)
const switchSticker = async (selectedChar: baseStudent | number) => {
    if (typeof selectedChar === 'number') {
        if (selectedChar === -1) {
            stickerTab.value = 1
            stickerList.value = proxy(stickers)
        }
        if (selectedChar === 1) {
            stickerList.value = proxy(stickers2)
            stickerTab.value = 2
        }
    } else {
        stickerTab.value = 2
        try {
            const loaded = await getStickers(selectedChar.Id)
            stickerList.value = proxy(loaded)
        } catch (_error) {
            stickerList.value = proxy(stickers3)
        }
    }
}

watch(
    () => store.language,
    async () => {
        await loadStudents()
    }
)

onMounted(async () => {
    await loadStudents()
    const scrollToBottom = document.getElementById('talkList') as HTMLElement
    scrollToBottom.scrollTop = scrollToBottom.scrollHeight
    const route = useRoute()
    const id = route.query.id as string
    if (id) {
        store.storyKey = id
        store.storyList = (await getMessage(store.storyKey, 'index')) as {}
        if (store.storyList) {
            if (!Object.keys(store.storyList).find((ele) => ele === store.storyFile))
                store.storyFile = Object.keys(store.storyList)[0]
            store.showPlayerDialog = true
        }
    }
    const textarea = document.querySelector('textarea') as HTMLElement
    textarea.onkeydown = (e: KeyboardEvent) => {
        if (!e.shiftKey && e.key === 'Enter') {
            e.preventDefault()
            _text()
        }
    }
})
</script>

<style scoped lang="scss">
@import './chat-view.scss';
@import '@/assets/css/icons.scss';
</style>
