import { useRef, useState } from 'react'

import TextInput from '@/components/TextInput'
import type { UserProfile } from '@/types'
import { cropAndCompressAvatar } from '@/utils/image'

interface Props {
  profile: UserProfile
  onSave: (patch: Partial<UserProfile>) => void
  onCancel: () => void
}

export default function EditUserInfoPage({ profile, onSave, onCancel }: Props) {
  const [nickname, setNickname] = useState(profile.nickname ?? '')
  const [avatar, setAvatar] = useState(profile.avatar ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await cropAndCompressAvatar(file)
      setAvatar(dataUrl)
    } catch {
      // 图片处理失败时不更新头像
    }
  }

  const handleSave = () => {
    onSave({ nickname: nickname.trim() || undefined, avatar: avatar || undefined })
    onCancel()
  }

  return (
    <div className="app-page relative bg-[var(--carbon-bg)]">
      <header className="app-header fixed top-0 z-10 flex w-full max-w-[430px] items-center justify-between border-b border-[var(--carbon-border)] bg-[var(--carbon-bg)]">
        <button
          onClick={onCancel}
          className="flex h-10 items-center justify-center px-4 text-[var(--carbon-text-secondary)]"
        >
          <span className="i-lucide-chevron-left h-6 w-6" />
        </button>
        <h1 className="text-base font-medium text-[var(--carbon-text)]">编辑资料</h1>
        <div className="w-14" />
      </header>

      <main
        className="flex flex-col gap-6 px-4 pb-8"
        style={{ paddingTop: 'calc(var(--app-header-height) + 24px)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="h-24 w-24 rounded-full border border-[var(--carbon-border)] object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--carbon-border)] bg-[var(--carbon-surface-subtle)] text-[var(--carbon-primary)]">
                <span className="i-lucide-user-round h-10 w-10" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--carbon-surface)] bg-[var(--carbon-primary)] text-[var(--carbon-text-on-primary)] shadow-sm">
              <span className="i-lucide-camera h-4 w-4" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <p className="text-xs text-[var(--carbon-text-secondary)]">点击更换头像</p>
        </div>

        <section className="mt-4 flex flex-col gap-3">
          <label
            htmlFor="nickname"
            className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--carbon-text-secondary)]"
          >
            昵称
          </label>
          <TextInput
            id="nickname"
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="本地用户"
          />
        </section>

        <div className="mt-8">
          <button
            onClick={handleSave}
            className="flex h-12 w-full items-center justify-center bg-[var(--carbon-primary)] px-6 text-sm font-medium text-[var(--carbon-text-on-primary)] shadow-sm transition-colors hover:bg-[var(--carbon-primary-hover)]"
          >
            保存修改
          </button>
        </div>
      </main>
    </div>
  )
}
