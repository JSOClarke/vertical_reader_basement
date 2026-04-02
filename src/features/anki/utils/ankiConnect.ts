import type { BookMetadata } from '../../../types';

const ANKI_URL = 'http://localhost:8765';

async function ankiRequest(action: string, params: Record<string, any> = {}) {
  const res = await fetch(ANKI_URL, {
    method: 'POST',
    body: JSON.stringify({ action, version: 6, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.result;
}

export async function getLastNoteId(): Promise<number> {
  const noteIds: number[] = await ankiRequest('findNotes', { query: 'added:7' });
  if (!noteIds || noteIds.length === 0) throw new Error('No recent Anki cards found');
  return Math.max(...noteIds);
}

export async function addTagToNote(noteId: number, tag: string): Promise<void> {
  await ankiRequest('addTags', { notes: [noteId], tags: tag });
}

export async function storeCoverMedia(base64Data: string, filename: string): Promise<string> {
  // Strip the data:image/...;base64, prefix if present
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  await ankiRequest('storeMediaFile', {
    filename,
    data: cleanBase64,
  });
  return filename;
}

export async function updateNoteField(noteId: number, fieldName: string, value: string): Promise<void> {
  // Get existing note info to preserve other fields
  const notesInfo = await ankiRequest('notesInfo', { notes: [noteId] });
  if (!notesInfo || notesInfo.length === 0) throw new Error('Could not fetch note info');
  
  const currentValue = notesInfo[0].fields[fieldName]?.value || '';
  const newValue = currentValue + value;
  
  await ankiRequest('updateNoteFields', {
    note: {
      id: noteId,
      fields: { [fieldName]: newValue },
    },
  });
}

export async function updateLastCard(metadata: BookMetadata | undefined, fieldName: string): Promise<string> {
  if (!fieldName || !fieldName.trim()) {
    throw new Error('No Anki field configured. Open Anki Settings from the menu first.');
  }

  const noteId = await getLastNoteId();
  
  // Add book title as a tag
  if (metadata?.title) {
    const sanitizedTitle = metadata.title.replace(/\s+/g, '_').replace(/[^\w\u3000-\u9fff]/g, '');
    const tag = `book::${sanitizedTitle}`;
    await addTagToNote(noteId, tag);
  }

  // Attach cover image if available
  if (metadata?.coverImage) {
    const ext = metadata.coverImage.startsWith('data:image/png') ? 'png' : 'jpg';
    const filename = `epub_cover_${Date.now()}.${ext}`;
    await storeCoverMedia(metadata.coverImage, filename);
    const imgTag = `<img src="${filename}">`;
    await updateNoteField(noteId, fieldName, imgTag);
  }

  return 'Card updated successfully!';
}
