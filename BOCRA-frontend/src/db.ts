import Dexie, { type Table } from 'dexie'

export interface CachedLicence {
  id:            string
  reference:     string
  licenceNumber: string
  licenseeName:  string
  category:      string
  status:        string
  issuedAt:      string
  expiresAt:     string | null
  stage?:        string
  [key: string]: unknown
}

export interface CachedPublication {
  id:          string
  title:       string
  category:    string
  description: string
  fileUrl:     string
  publishedAt: string
  blobKey?:    string
}

export interface DownloadedFile {
  key:          string
  blob:         Blob
  fileName:     string
  downloadedAt: number
}

class BocraDB extends Dexie {
  licences!:      Table<CachedLicence>
  publications!:  Table<CachedPublication>
  downloads!:     Table<DownloadedFile>

  constructor() {
    super('bocra-offline')
    this.version(1).stores({
      licences:     'id, reference, licenceNumber, licenseeName, category, status',
      publications: 'id, title, category, publishedAt',
      downloads:    'key, fileName, downloadedAt',
    })
  }
}

export const db = new BocraDB()