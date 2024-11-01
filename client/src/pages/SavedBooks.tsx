import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { removeBookId, saveBookIds } from '../utils/localStorage';
import Auth from '../utils/auth';



const SavedBooks: React.FC = () => {
  // Fetch user data on component load using `useQuery`
  const { loading, data } = useQuery(GET_ME,{
    variables: { saveBookIds },


  });

  const userData = data?.me || {};// optional chaining syntax

if (userData.savedBooks) {
  saveBookIds(userData.savedBooks.map(({ bookId }: any) => bookId));
}

  
  // Define the REMOVE_BOOK mutation
  const [removeBook] = useMutation(REMOVE_BOOK, {
    update(cache, { data: { removeBook } }) {
      // Update the cache to remove the deleted book from savedBooks
      const existingData = cache.readQuery({ query: GET_ME }) as { me: any };
      if (existingData) {
        cache.writeQuery({
          query: GET_ME,
          data: {
            me: {
              ...existingData.me,
              savedBooks: existingData.me.savedBooks.filter(
                (book: any) => book.bookId !== removeBook.bookId
              ),
            },
          },
        });
      }
    },
  });





  // Handle the deletion of a book
  const handleDeleteBook = async (bookId: string) => {
    if (!Auth.loggedIn()) {
      return;
    }

    try {
      await removeBook({
        variables: { bookId },
      });
      // Remove book ID from local storage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          <h1>Viewing {userData.username ? `${userData.username}'s` : 'your'} saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks?.map((book: any) => (
            <Col md='4' key={book.bookId}>
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
                  <p className='small'>Authors: {book.authors.join(', ')}</p>
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
