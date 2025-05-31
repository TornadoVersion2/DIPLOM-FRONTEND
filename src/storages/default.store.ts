import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import type { User } from "../types/auth.types";

export const useDefaultStore = defineStore('default', () => {
    const user = ref(reactive<User>(({} as User)));

    return { user }
})

