import { useUploads } from '../../store/uploads'
import { UploadWidgetUploadItem } from './upload-item'

export function UploadWidgetUploadList() {
  const uploads = useUploads(store => store.uploads)

  const isUploadListEmpty = !uploads.size

  return (
    <div className="px-3 flex flex-col gap-3">
      <span className="text-xs font-medium">
        Uploaded files <span className="text-zinc-400">({uploads.size})</span>
      </span>

      {isUploadListEmpty ? (
        <span className="text-xs text-zinc-400">No uploads added</span>
      ) : (
        <div className="space-y-2">
          {[...uploads].map(([uploadId, upload]) => (
            <UploadWidgetUploadItem
              key={uploadId}
              upload={upload}
              uploadId={uploadId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
