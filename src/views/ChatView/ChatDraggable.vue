<script setup lang="ts">
import draggable from 'vuedraggable'
import TypingAnimation from '@/components/TypingAnimation.vue'
import ChatBlock from './ChatBlock.vue'
import ReplyBlock from './ReplyBlock.vue'
import { readFile } from '@/assets/imgUtils/readFile'
import { store } from '@/assets/storeUtils/store'
import { talkHistory } from '@/assets/storeUtils/talkHistory'
import { saveEdit } from '@/assets/storeUtils/saveEdit'
import { Talk } from '@/assets/requestUtils/interface'

const props = defineProps({
    tasks: {
        required: true,
        type: Array
    },
    selectedTalkId: {
        required: false,
        type: Number,
        default: -1
    }
})

const emit = defineEmits(['select-talk'])

const changeImage = (evt: Event, id: number) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        const ele = evt.target! as HTMLImageElement
        ele.src = reader.result as string
        talkHistory.setTalkContent(id, reader.result as string)
    })
    readFile(reader)
}

const checkMove = (e: any) => {
    const i = e.newIndex
    const j = e.oldIndex
    talkHistory.checkMove(i, j)
}

const splitTalks = (element: Talk) => {
    if (element.flag < 2) element.flag = 1 - element.flag
    talkHistory.setData()
}

const checkImg = (content: string) => {
    const suffix = `(bmp|jpg|png|tif|gif|svg|webp|jpeg)`
    const regular = new RegExp(`(data:image.*)|((http|https)://.*.${suffix})`)
    return regular.test(content)
}

const setInsert = (insertId: number) => {
    if (store.insertId === insertId) {
        store.insertId = -1
    } else {
        store.insertId = insertId
        const textarea = document.querySelector('textarea') as HTMLElement
        textarea.focus()
    }
}

const getTextStyle = (element: Talk) => {
    return {
        fontFamily: element.style?.fontFamily,
        fontSize: element.style?.fontSize ? `${element.style.fontSize}px` : undefined,
        fontWeight: element.style?.fontWeight,
        textAlign: element.style?.textAlign,
        color: element.style?.color
    }
}

const getImageStyle = (element: Talk) => {
    return {
        width: element.style?.imageWidth ? `${element.style.imageWidth}%` : '100%'
    }
}
</script>

<template>
    <draggable :list="tasks" :group="{ name: 'g1' }" item-key="Id" @end="checkMove" :disabled="store.draggable">
        <template #item="{ element }">
            <div
                :class="{
                    student: element.type === 0,
                    sensei: element.type === 1,
                    story: element.type === 2,
                    choice: element.type == 3,
                    message: element.type === 4,
                    first: element.type <= 1 && element.flag > 0,
                    selected: selectedTalkId === element.Id
                }"
            >
                <div class="student--split" v-if="element.type === 0 && element.flag === 0" @click="splitTalks(element)"></div>
                <div class="avatar" v-if="element.type === 0 && element.flag > 0">
                    <img v-lazy="element.Avatar" @click="splitTalks(element)" />
                </div>
                <div class="name" v-if="element.type === 0 && element.flag > 0" contenteditable @blur="saveEdit($event, element.Id, 'name')">
                    {{ element.Name }}
                </div>

                <div class="container" @click="emit('select-talk', element)">
                    <div class="box-story" v-if="element.type === 2">
                        <div class="header" contenteditable @blur="saveEdit($event, element.Id, 'name')">
                            <div class="title">{{ element.Name }}</div>
                        </div>
                        <div class="content" :style="getTextStyle(element)">
                            <chat-block :element="element" />
                        </div>
                    </div>

                    <div class="box-choice" v-else-if="element.type === 3">
                        <div class="header" contenteditable @blur="saveEdit($event, element.Id, 'name')">
                            <div class="title">{{ element.Name }}</div>
                        </div>
                        <div class="content" :style="getTextStyle(element)">
                            <span v-for="(con, index) of element.content.split('\n')" :key="index">
                                <reply-block :element="element" :content="con" :index="index" />
                            </span>
                        </div>
                    </div>

                    <div class="box-message" v-else-if="element.type === 4" :style="getTextStyle(element)">
                        <div class="content">
                            <chat-block :element="element" />
                        </div>
                    </div>

                    <div class="box img" v-else-if="checkImg(element.content)" :style="getTextStyle(element)">
                        <typing-animation class="loading" v-if="store.typing > 0 && element.Id === talkHistory.talkId - 1"></typing-animation>
                        <img
                            v-else
                            :src="element.content"
                            class="chat-img"
                            :style="getImageStyle(element)"
                            @click="changeImage($event, element.Id)"
                        />
                    </div>

                    <div class="box" v-else :style="getTextStyle(element)">
                        <typing-animation class="loading" v-if="store.typing > 0 && element.Id === talkHistory.talkId - 1"></typing-animation>
                        <chat-block v-else :element="element" />
                    </div>

                    <span class="action-block">
                        <span @click.stop="talkHistory.deleteTalkById(element.Id)">x</span>
                        <span @click.stop="setInsert(element.Id)">↲</span>
                    </span>
                </div>
                <div class="insert-indicator" v-if="store.insertId === element.Id">insert here</div>
            </div>
        </template>
    </draggable>
</template>

<style scoped lang="scss">
@import '@/views/ChatView/chat-draggable.scss';
</style>
