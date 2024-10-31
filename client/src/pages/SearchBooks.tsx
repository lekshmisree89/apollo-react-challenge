import { useState, type FormEvent } from 'react';
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  Row
} from 'react-bootstrap';
import { searchGoogleBooks } from '../utils/API';
import { useMutation } from '@apollo/client';
import { SAVE_BOOK } from '../utils/mutations';
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
  const [saveBook ] = useMutation(SAVE_BOOK);

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const book = items.map((book: any) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(book);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBook = async (bookId: string) => {
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    if (!bookToSave) {
      return;
    }

    try {
      await saveBook({
        variables: { input: bookToSave }
      });
    } catch (err) {
      console.error(err);
    }

    setSearchedBooks(searchedBooks.filter((book) => book.bookId !== bookId));
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
                    disabled={!(book.bookId)}
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
    </Container>
  );

}
 export default SearchBooks;
    