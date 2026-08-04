// enayah-frontend/src/modules/hr/credentials/hooks/use-degree-document-actions.ts

'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { credentialDegreeService } from '../services/credential-degree.service'
import { credentialService } from '../services/credential.service'

interface UseDegreeDocumentActionsOptions {
  employeeId: string
  degreeId: string
  originalName: string
}

function schedulePreviewUrlCleanup(
  objectUrl: string,
  previewWindow: Window,
): void {
  let cleanedUp = false

  const cleanUp = (): void => {
    if (cleanedUp) {
      return
    }

    cleanedUp = true

    window.clearInterval(intervalId)
    window.clearTimeout(timeoutId)
    URL.revokeObjectURL(objectUrl)
  }

  const intervalId = window.setInterval(() => {
    if (previewWindow.closed) {
      cleanUp()
    }
  }, 1_000)

  /*
   * Fallback cleanup in case the browser does not reliably
   * expose the preview window's closed state.
   */
  const timeoutId = window.setTimeout(cleanUp, 5 * 60 * 1_000)
}

export function useDegreeDocumentActions({
  employeeId,
  degreeId,
  originalName,
}: UseDegreeDocumentActionsOptions) {
  const t = useTranslations('credentials.degreeDocument')

  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  async function previewDocument(): Promise<void> {
    if (isPreviewing) {
      return
    }

    /*
     * Open the window synchronously so the browser does not
     * classify it as an unsolicited popup after the API call.
     */
    const previewWindow = window.open('', '_blank')

    if (!previewWindow) {
      toast.error(t('previewBlocked'))
      return
    }

    previewWindow.opener = null
    setIsPreviewing(true)

    try {
      const blob = await credentialService.previewDocument({
        employeeId,
        degreeId,
      })

      const objectUrl = URL.createObjectURL(blob)

      previewWindow.location.replace(objectUrl)

      schedulePreviewUrlCleanup(objectUrl, previewWindow)
    } catch {
      previewWindow.close()
      toast.error(t('previewFailed'))
    } finally {
      setIsPreviewing(false)
    }
  }

  async function downloadDocument(): Promise<void> {
    if (isDownloading) {
      return
    }

    setIsDownloading(true)

    let objectUrl: string | null = null

    try {
      const blob = await credentialService.downloadDocument({
        employeeId,
        degreeId,
      })

      objectUrl = URL.createObjectURL(blob)

      const anchor = document.createElement('a')

      anchor.href = objectUrl
      anchor.download = originalName
      anchor.style.display = 'none'

      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      /*
       * Give the browser time to start consuming the object
       * URL before releasing it.
       */
      window.setTimeout(() => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }
      }, 1_000)
    } catch {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }

      toast.error(t('downloadFailed'))
    } finally {
      setIsDownloading(false)
    }
  }

  return {
    previewDocument,
    downloadDocument,
    isPreviewing,
    isDownloading,
  }
}
