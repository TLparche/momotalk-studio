<script setup lang="ts">
import { ref } from 'vue'
import { readFile } from '@/assets/imgUtils/readFile'
import { characterManager } from '@/assets/storeUtils/characterManager'
import IconClose from '@/components/icons/IconClose2.vue'

const name = ref('')

const addCharacter = () => {
    characterManager.addCharacter(name.value)
    name.value = ''
}

const addFace = (id: number) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        characterManager.addFace(id, reader.result as string)
    })
    readFile(reader)
}
</script>

<template>
    <main class="characters">
        <section class="characters__create">
            <h2>Character Management</h2>
            <div class="create-row">
                <input
                    v-model="name"
                    type="text"
                    placeholder="Character name"
                    @keydown.enter.prevent="addCharacter"
                />
                <button @click="addCharacter">Add Character</button>
            </div>
        </section>

        <section class="characters__list">
            <article class="character-card" v-for="character in characterManager.characters" :key="character.id">
                <header>
                    <h3>{{ character.name }}</h3>
                    <button class="delete-btn" @click="characterManager.removeCharacter(character.id)">
                        <IconClose />
                    </button>
                </header>

                <div class="face-grid">
                    <div class="face" v-for="(face, index) in character.faces" :key="`${character.id}-${index}`">
                        <img :src="face" :alt="`${character.name} face ${index + 1}`" />
                        <button
                            class="face-delete"
                            @click="characterManager.removeFace(character.id, index)"
                        >
                            x
                        </button>
                    </div>
                    <button class="add-face" @click="addFace(character.id)">+ Add Face</button>
                </div>
            </article>
        </section>
    </main>
</template>

<style scoped lang="scss">
.characters {
    height: 100%;
    padding: 16px;
    background: $list-color;
    @include hide-scrollbar;

    &__create,
    &__list {
        background: white;
        border: 1px solid $chatborder-color;
        border-radius: 10px;
        padding: 14px;
    }

    &__list {
        margin-top: 14px;
        display: grid;
        gap: 12px;
    }
}

.create-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    margin-top: 10px;

    input {
        border: 1px solid $chatborder-color;
        border-radius: 8px;
        padding: 10px;
        @include font-light(16px);
    }

    button {
        border: none;
        border-radius: 8px;
        background: var(--theme_title_color);
        color: white;
        padding: 0 14px;
        cursor: pointer;
        @include font-regular(15px);
    }
}

.character-card {
    border: 1px solid $chatborder-color;
    border-radius: 10px;
    padding: 12px;
    background: #fdfdff;

    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        h3 {
            @include font-regular(18px);
            color: $font-black;
        }
    }
}

.delete-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    width: 20px;
    height: 20px;
}

.face-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 8px;
}

.face {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid $chatborder-color;

    img {
        width: 100%;
        aspect-ratio: 1/1;
        object-fit: cover;
        display: block;
    }
}

.face-delete {
    position: absolute;
    top: 4px;
    right: 4px;
    border: none;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    cursor: pointer;
}

.add-face {
    border: 1px dashed $chatborder-color;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    @include font-regular(14px);
    color: $font-grey;
    min-height: 85px;
}
</style>
