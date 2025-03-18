import * as Collapsible from '@radix-ui/react-collapsible'
import { useState } from 'react'
import { UploadWidgetDropzone } from './drozone'
import { UploadWidgetHeader } from './header'
import { UploadWidgetMinimizedButton } from './minimized-button'
import { UploadWidgetUploadList } from './upload-list'

export function UploadWidget() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)

  return (
    <Collapsible.Root onOpenChange={setIsWidgetOpen}>
      <div className="bg-zinc-900 w-[360px] rounded-xl shadow-shape overflow-hidden">
        {!isWidgetOpen && <UploadWidgetMinimizedButton />}

        <Collapsible.Content>
          <UploadWidgetHeader />

          <div className="flex flex-col gap-4 py-3">
            <UploadWidgetDropzone />

            <div className="h-px bg-zinc-800 border-t border-black/50 box-content" />

            <UploadWidgetUploadList />
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}
