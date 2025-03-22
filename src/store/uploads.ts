import { CanceledError } from 'axios'
import { enableMapSet } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useShallow } from 'zustand/shallow'
import { uploadFileToStorage } from '../services/upload-file-to-storage'
import { compressImage } from '../utils/compress-image'

export type Upload = {
  name: string
  file: File
  status: 'progress' | 'success' | 'error' | 'canceled'
  abortController?: AbortController
  uploadSizeInBytes: number
  originalSizeInBytes: number
  compressedSizeInBytes?: number
  remoteUrl?: string
}

type UploadState = {
  uploads: Map<string, Upload>
  addUploads: (files: File[]) => void
  cancelUpload: (uploadId: string) => void
  retryUpload: (uploadId: string) => void
}

enableMapSet()

export const useUploads = create<UploadState, [['zustand/immer', never]]>(
  immer((set, get) => {
    function updateUpload(uploadId: string, data: Partial<Upload>) {
      const upload = get().uploads.get(uploadId)

      if (!upload) return

      set(state => {
        state.uploads.set(uploadId, {
          ...upload,
          ...data,
        })
      })
    }

    async function processUpload(uploadId: string) {
      const upload = get().uploads.get(uploadId)

      if (!upload) return

      const abortController = new AbortController()

      updateUpload(uploadId, {
        abortController,
        uploadSizeInBytes: 0,
        compressedSizeInBytes: undefined,
        remoteUrl: undefined,
        status: 'progress',
      })

      try {
        const compressedFile = await compressImage({
          file: upload.file,
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.8,
        })

        updateUpload(uploadId, { compressedSizeInBytes: compressedFile.size })

        const { url } = await uploadFileToStorage(
          {
            file: compressedFile,
            onProgress(sizeInBytes) {
              updateUpload(uploadId, { uploadSizeInBytes: sizeInBytes })
            },
          },
          { signal: abortController.signal }
        )

        updateUpload(uploadId, { status: 'success', remoteUrl: url })
      } catch (err) {
        updateUpload(uploadId, {
          status: err instanceof CanceledError ? 'canceled' : 'error',
        })
      }
    }

    function addUploads(files: File[]) {
      for (const file of files) {
        const uploadId = crypto.randomUUID()

        const upload = {
          name: file.name,
          file,
          status: 'progress',
          originalSizeInBytes: file.size,
          uploadSizeInBytes: 0,
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

      upload.abortController?.abort()
    }

    function retryUpload(uploadId: string) {
      processUpload(uploadId)
    }

    return {
      uploads: new Map(),
      addUploads,
      cancelUpload,
      retryUpload,
    }
  })
)

export const usePendingUploads = () => {
  return useUploads(
    useShallow(store => {
      const uploads = [...store.uploads.values()]
      const isPendingUploads = uploads.some(
        upload => upload.status === 'progress'
      )

      if (!isPendingUploads) {
        return { isPendingUploads, globalPercentage: 100 }
      }

      const { total, uploaded } = uploads.reduce(
        (acc, upload) => {
          if (upload.compressedSizeInBytes) {
            acc.uploaded += upload.uploadSizeInBytes
          }
          acc.total +=
            upload.compressedSizeInBytes ?? upload.originalSizeInBytes

          return acc
        },
        { total: 0, uploaded: 0 }
      )

      const globalPercentage = Math.min(
        Math.round((uploaded / total) * 100),
        100
      )

      return { isPendingUploads, globalPercentage }
    })
  )
}
