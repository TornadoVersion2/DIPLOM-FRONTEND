import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import type { User } from "../services/auth.service";

export const useDefaultStore = defineStore('default', () => {
    const user = ref(reactive<User>(({} as User)));

    return { user }
})

