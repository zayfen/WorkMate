export {};

declare global {
  interface Window {
    api?: {
      ping: () => Promise<string>
      getAppVersion?: () => Promise<string>
      getUserProfile?: () => Promise<{
        id: number
        name: string
        avatar_path: string | null
        avatar_base64: string | null
        note: string | null
        local_id: string
        last_seen: number
        device_info: string | null
      } | null>
      saveUserProfile?: (payload: { name?: string; note?: string; avatar_base64?: string | null }) => Promise<{
        id: number
        name: string
        avatar_path: string | null
        avatar_base64: string | null
        note: string | null
        local_id: string
        last_seen: number
        device_info: string | null
      } | null>
      getDeviceId?: () => Promise<string>
      chooseAvatar?: () => Promise<string | null>
    }
  }
}


