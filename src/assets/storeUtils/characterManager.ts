import { reactive } from 'vue'

interface ManagedCharacter {
    id: number
    name: string
    faces: string[]
}

const nextId = () => Date.now() + Math.floor(Math.random() * 10000)

export const characterManager = reactive({
    characters: [] as ManagedCharacter[],

    addCharacter(name: string) {
        const trimmed = name.trim()
        if (!trimmed) return
        this.characters.unshift({
            id: nextId(),
            name: trimmed,
            faces: []
        })
        this.setData()
    },

    removeCharacter(id: number) {
        const index = this.characters.findIndex((item) => item.id === id)
        if (index === -1) return
        this.characters.splice(index, 1)
        this.setData()
    },

    addFace(id: number, face: string) {
        const character = this.characters.find((item) => item.id === id)
        if (!character) return
        if (!character.faces.includes(face)) {
            character.faces.push(face)
            this.setData()
        }
    },

    removeFace(id: number, faceIndex: number) {
        const character = this.characters.find((item) => item.id === id)
        if (!character) return
        character.faces.splice(faceIndex, 1)
        this.setData()
    },

    setData() {
        localStorage.setItem('customCharacters', JSON.stringify(this.characters))
    },

    getData() {
        const raw = localStorage.getItem('customCharacters')
        this.characters = raw != null ? JSON.parse(raw) : []
    }
})

export type { ManagedCharacter }
