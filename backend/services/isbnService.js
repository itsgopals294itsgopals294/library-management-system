import axios from 'axios';

/**
 * Fetch bibliographic metadata for an ISBN using Google Books with Open Library fallback
 */
export const lookupIsbn = async (rawIsbn) => {
  if (!rawIsbn) throw new Error('ISBN is required');
  const cleanIsbn = rawIsbn.replace(/[^0-9X]/gi, '').trim();

  // Try Google Books API first
  try {
    const gbooksUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`;
    const response = await axios.get(gbooksUrl, { timeout: 6000 });

    if (response.data && response.data.totalItems > 0 && response.data.items[0].volumeInfo) {
      const info = response.data.items[0].volumeInfo;
      const publishedYear = info.publishedDate ? parseInt(info.publishedDate.substring(0, 4), 10) : new Date().getFullYear();

      let coverImage = '';
      if (info.imageLinks) {
        coverImage = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
        coverImage = coverImage.replace('http://', 'https://');
      }

      return {
        source: 'Google Books',
        isbn: cleanIsbn,
        title: info.title || '',
        subtitle: info.subtitle || '',
        authors: info.authors || ['Unknown Author'],
        publisher: info.publisher || 'Unknown Publisher',
        publishedYear: publishedYear || undefined,
        description: info.description || '',
        pageCount: info.pageCount || 0,
        category: info.categories ? info.categories[0] : 'General',
        language: info.language ? (info.language === 'en' ? 'English' : info.language) : 'English',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
        tags: info.categories || [],
      };
    }
  } catch (gErr) {
    console.warn(`[ISBN Lookup] Google Books failed or timed out (${gErr.message}), falling back to Open Library...`);
  }

  // Fallback to Open Library
  try {
    const olUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&jscmd=data&format=json`;
    const olRes = await axios.get(olUrl, { timeout: 6000 });
    const key = `ISBN:${cleanIsbn}`;

    if (olRes.data && olRes.data[key]) {
      const data = olRes.data[key];
      const authors = data.authors ? data.authors.map((a) => a.name) : ['Unknown Author'];
      const publishedYear = data.publish_date ? parseInt(data.publish_date.match(/\d{4}/)?.[0] || '0', 10) : undefined;
      const coverImage = data.cover?.large || data.cover?.medium || data.cover?.small || '';

      return {
        source: 'Open Library',
        isbn: cleanIsbn,
        title: data.title || '',
        subtitle: data.subtitle || '',
        authors,
        publisher: data.publishers ? data.publishers[0]?.name : 'Unknown Publisher',
        publishedYear,
        description: data.notes || (typeof data.description === 'string' ? data.description : data.description?.value) || '',
        pageCount: data.number_of_pages || 0,
        category: data.subjects ? data.subjects[0]?.name : 'General',
        language: 'English',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
        tags: data.subjects ? data.subjects.slice(0, 5).map((s) => s.name) : [],
      };
    }
  } catch (olErr) {
    console.warn(`[ISBN Lookup] Open Library failed: ${olErr.message}`);
  }

  throw new Error(`No bibliographic record found for ISBN: ${cleanIsbn}. You can enter details manually.`);
};
