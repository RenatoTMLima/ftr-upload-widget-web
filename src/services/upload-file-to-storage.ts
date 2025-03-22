import axios from 'axios'

type UploadFileToStorageParams = {
  file: File
}

type UploadFileToStorageOpts = {
  signal?: AbortSignal
}

export async function uploadFileToStorage(
  { file }: UploadFileToStorageParams,
  opts?: UploadFileToStorageOpts
) {
  const data = new FormData()

  data.append('file', file)

  const response = await axios.post<{ url: string }>(
    'http://localhost:3333/uploads',
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal: opts?.signal,
    }
  )

  return response.data
}
