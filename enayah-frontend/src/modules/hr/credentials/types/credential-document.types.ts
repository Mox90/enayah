export type CredentialDocumentMetadata = {
  id: string
  originalName: string
  mimeType: string
  fileSize: number
}

export type CredentialDocumentAccessRequest = {
  employeeId: string
  credentialId: string
}

export type CredentialDocumentAccessService = {
  previewDocument: (request: CredentialDocumentAccessRequest) => Promise<Blob>

  downloadDocument: (request: CredentialDocumentAccessRequest) => Promise<Blob>
}
