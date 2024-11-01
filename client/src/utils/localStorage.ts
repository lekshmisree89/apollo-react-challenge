// Retrieves an array of saved book IDs from localStorage
export const getSavedBookIds = (): string[] => {
  const savedBookIds = localStorage.getItem('saved_books');
  return savedBookIds ? JSON.parse(savedBookIds) : [];
};

// Saves an array of book IDs to localStorage
export const saveBookIds = (bookIdArr: string[]): void => {
  if (bookIdArr.length > 0) {
    localStorage.setItem('saved_books', JSON.stringify(bookIdArr));
  } else {
    localStorage.removeItem('saved_books');
  }
};

// Removes a specific book ID from localStorage
export const removeBookId = (bookId: string): boolean => {
  const savedBookIds: string[] | null = JSON.parse(localStorage.getItem('saved_books') || 'null');

  if (!savedBookIds) return false;

  const updatedSavedBookIds = savedBookIds.filter((savedBookId) => savedBookId !== bookId);
  
  if (updatedSavedBookIds.length > 0) {
    localStorage.setItem('saved_books', JSON.stringify(updatedSavedBookIds));
  } else {
    localStorage.removeItem('saved_books');
  }

  return true;
};
