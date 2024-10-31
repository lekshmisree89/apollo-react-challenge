import { useState } from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries'; // Import the GET_ME query
import { REMOVE_BOOK } from '../utils/mutations'; // Import the REMOVE_BOOK mutation
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';

const SavedBooks = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch user data using the useQuery hook
  const { loading, error, data } = useQuery(GET_ME);
  const [removeBook] = useMutation(REMOVE_BOOK, {
    onCompleted: () => {
      // Optionally, handle any completion logic here, like removing the book from local storage
    },
    onError: (err) => {
      console.error(err);
      setErrorMessage('Failed to delete the book.');
    },
  });

  // Check if data is loading
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  // Handle errors from the query
  if (error) {
    console.error(error);
    return <h2>Failed to load user data.</h2>;
  }

  const userData: User = data.me;

  // Create function to handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId }, // Pass the bookId as a variable to the mutation
      });
      
      // Remove book's id from localStorage upon success
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to delete the book.');
    }
  };

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          <h1>
            Viewing {userData.username ? `${userData.username}'s` : ''} saved books!
          </h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        {errorMessage && <p className='text-danger'>{errorMessage}</p>} {/* Display error message */}
        <Row>
          {userData.savedBooks.map((book) => (
            <Col md='4' key={book.bookId}> {/* Moved key to the Col */}
              <Card border='dark'>
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant='top'
                  />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors.join(', ')}</p> {/* Joining authors */}
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className='btn-block btn-danger'
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
