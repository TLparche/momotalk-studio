import { reactive } from 'vue'
import { baseStudent } from '../requestUtils/interface'

export const selectList = reactive({
    selectList: [] as baseStudent[],

    getStudentIndexById(id: number) {
        return this.selectList.findIndex((item: baseStudent) => item.Id === id)
    },

    deleteStudent(id: number) {
        const index: number = this.getStudentIndexById(id)
        this.selectList.splice(index, 1)
        this.setData()
    },
    pushStudent(student: baseStudent) {
        const index = this.getStudentIndexById(student.Id)
        if (index !== -1) {
            this.selectList[index] = student
            const latest = this.selectList.splice(index, 1)[0]
            this.selectList.unshift(latest)
            this.setData()
            return
        }
        this.selectList.unshift(student) // push to beginning
        this.setData()
    },

    setData() {
        localStorage.setItem('selectHistory', JSON.stringify(this.selectList))
    },
    getData() {
        const data = localStorage.getItem('selectHistory')
        this.selectList = data != null ? JSON.parse(data) : ([] as baseStudent[])
    },
    resetData() {
        this.selectList = [] as baseStudent[]
        this.setData()
    }
})
