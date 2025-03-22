import { enableMapSet } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { uploadFileToStorage } from '../services/upload-file-to-storage'

export type Upload = {
  name: string
  file: File
  status: 'progress' | 'success' | 'error' | 'canceled'
  abortController: AbortController
}

type UploadState = {
  uploads: Map<string, Upload>
  addUploads: (files: File[]) => void
  cancelUpload: (uploadId: string) => void
}

enableMapSet()

export const useUploads = create<UploadState, [['zustand/immer', never]]>(
  immer((set, get) => {
    async function processUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId)

      if (!upload) return

      try {
        await uploadFileToStorage(
          { file: upload.file },
          { signal: upload.abortController.signal }
        )

        set(state => {
          state.uploads.set(uploadId, {
            ...upload,
            status: 'success',
          })
        })
      } catch {
        if (get().uploads.get(uploadId)?.status === 'canceled') return

        set(state => {
          state.uploads.set(uploadId, {
            ...upload,
            status: 'error',
          })
        })
      }
    }

    function addUploads(files: File[]) {
      for (const file of files) {
        const uploadId = crypto.randomUUID()
        const abortController = new AbortController()

        const upload = {
          name: file.name,
          file,
          status: 'progress',
          abortController,
        } satisfies Upload

        set(state => {
          state.uploads.set(uploadId, upload)
        })

        processUpload(uploadId)
      }
    }

    function cancelUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId)

      if (!upload) return

      upload.abortController.abort()

      set(state => {
        state.uploads.set(uploadId, { ...upload, status: 'canceled' })
      })
    }

    return {
      uploads: new Map(),
      addUploads,
      cancelUpload,
    }
  })
)
