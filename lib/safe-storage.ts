type Backend = "local" | "session" | "memory"

function isStorageAvailable(kind: "localStorage" | "sessionStorage") {
  try {
    if (typeof window === "undefined") return false
    const s = window[kind]
    const testKey = "__storage_test__"
    s.setItem(testKey, "1")
    s.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

const memoryStore = new Map<string, string>()

export const storage = {
  backend: "memory" as Backend,

  init() {
    if (typeof window === "undefined") {
      this.backend = "memory"
      return this
    }
    if (isStorageAvailable("localStorage")) {
      this.backend = "local"
    } else if (isStorageAvailable("sessionStorage")) {
      this.backend = "session"
    } else {
      this.backend = "memory"
    }
    return this
  },

  getItem(key: string): string | null {
    if (typeof window === "undefined") return memoryStore.get(key) ?? null
    if (this.backend === "local") return window.localStorage.getItem(key)
    if (this.backend === "session") return window.sessionStorage.getItem(key)
    return memoryStore.get(key) ?? null
  },

  setItem(key: string, value: string) {
    if (typeof window === "undefined") {
      memoryStore.set(key, value)
      return
    }
    if (this.backend === "local") {
      window.localStorage.setItem(key, value)
    } else if (this.backend === "session") {
      window.sessionStorage.setItem(key, value)
    } else {
      memoryStore.set(key, value)
    }
  },

  removeItem(key: string) {
    if (typeof window === "undefined") {
      memoryStore.delete(key)
      return
    }
    if (this.backend === "local") {
      window.localStorage.removeItem(key)
    } else if (this.backend === "session") {
      window.sessionStorage.removeItem(key)
    } else {
      memoryStore.delete(key)
    }
  },
}.init()
