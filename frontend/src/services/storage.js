import { supabase, isSupabaseConfigured } from './supabase'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain'
]

export const validateEvidenceFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file selected.' }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum 10MB limit.' }
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Only JPG, PNG, WEBP, PDF, and TXT are permitted.' }
  }
  return { valid: true }
}

export const uploadEvidenceFile = async (userId, file) => {
  const validation = validateEvidenceFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  if (!isSupabaseConfigured()) {
    // Demo mode: Return a mock attachment record without network error
    return {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storagePath: `demo/${userId}/${Date.now()}_${file.name}`,
      uploadedAt: new Date().toISOString(),
      isDemo: true
    }
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${userId}/${Date.now()}_${cleanFileName}`

  const { data, error } = await supabase.storage
    .from('evidence_vault')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    storagePath: data.path,
    uploadedAt: new Date().toISOString(),
    isDemo: false
  }
}
