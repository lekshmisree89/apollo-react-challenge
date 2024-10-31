import { useState, useEffect, type FormEvent } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row,
} from 'react-bootstrap';
import { searchGoogleBooks } from '../utils/API'; // Keep this for searching books
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations'; // Import the SAVE_BOOK mutation
import Auth from '../utils/auth';

type Book = {
  bookId: string;
  authors: string[];
  title: string;
  description: string;
  image: string;
};

const SearchBooks = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize the useMutation hook for the SAVE_BOOK mutation
  const [saveBookMutation] = useMutation(SAVE_BOOK);

  useEffect(() => {
    return () => {
      setSearchedBooks([]);
    };
  }, []);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput) {
      return;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('Something went wrong!');
      }

      const data = await response.json();
      const { items } = data;

      if (!items || items.length === 0) {
        console.log('No books found');
        return;
      }

      const books = items.map((book: any) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(books);
      setSearchInput('');
      setErrorMessage('');
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to fetch books. Please try again.');
    }
  };

  const handleSaveBook = async (bookId: string) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    if (!bookToSave) {
      return;
    }

    try {
      // Execute the SAVE_BOOK mutation
      await saveBookMutation({
        variables: { input: bookToSave }, // Pass the book data as input
      });

      console.log(`Book saved: ${bookId}`); // Log success

      // Update state to remove the saved book from the search results
      setSearchedBooks(searchedBooks.filter((book) => book.bookId !== bookId));
    } catch (err) {
      console.error('Error saving book:', err); // Log error
      setErrorMessage('Failed to save book. Please try again.'); // Set error message if needed
    }
  };

  return (
    <Container>
      <h2>Search for Books</h2>
      <Form onSubmit={handleFormSubmit}>
        <Form.Label htmlFor="searchInput">Search for a book:</Form.Label>

        <Row>
          <Col xs={12} md={8}>
            <Form.Control
              name="searchInput"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              size="lg"
              placeholder="Search for a book"
            />
          </Col>
          <Col xs={12} md={4}>
            <Button type="submit" variant="success" size="lg">
              Submit Search
            </Button>
          </Col>
        </Row>
      </Form>
      <h2>Results</h2>
      <Row>
        {searchedBooks.map((book) => (
          <Col key={book.bookId} xs={12} md={6} lg={4}>
            <Card>
              <Card.Img src={book.image} alt={`The cover for ${book.title}`} />
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p>Authors: {book.authors.join(', ')}</p>
                <Card.Text>{book.description}</Card.Text>
                {Auth.loggedIn() && (
                  <Button
                    disabled={!book.bookId}
                    onClick={() => handleSaveBook(book.bookId)}
                  >
                    Save this Book!
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      {errorMessage && <p className="text-danger">{errorMessage}</p>} {/* Display error message */}
    </Container>
  );
};

export default SearchBooks;
