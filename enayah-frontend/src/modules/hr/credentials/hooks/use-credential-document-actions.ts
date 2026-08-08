// enayah-frontend/src/modules/hr/credentials/hooks/use-degree-document-actions.ts

'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { credentialService } from '../services/credential.service'
import { CredentialDocumentAccessService } from '../types/credential-document.types'

interface UseDegreeDocumentActionsOptions {
  employeeId: string
  degreeId: string
  originalName: string
}

interface UseCredentialDocumentActionsOptions {
  employeeId: string
  credentialId: string
  originalName: string
  service: CredentialDocumentAccessService
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

export function useCredentialDocumentActions({
  employeeId,
  credentialId,
  originalName,
  service,
}: UseCredentialDocumentActionsOptions) {
  const t = useTranslations('credentials.credentialDocument')

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
      const blob = await service.previewDocument({
        employeeId,
        credentialId,
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
      const blob = await service.downloadDocument({
        employeeId,
        credentialId,
      })

      objectUrl = URL.createObjectURL(blob)

      const anchor = document.createElement('a')

      anchor.href = objectUrl
      anchor.download = originalName
      anchor.style.display = 'none'

      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      const urlToRevoke = objectUrl

      /*
       * Give the browser time to start consuming the object
       * URL before releasing it.
       */
      window.setTimeout(() => {
        if (urlToRevoke) {
          URL.revokeObjectURL(urlToRevoke)
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
