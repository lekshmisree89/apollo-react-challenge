import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

//import { createUser } from '../utils/API';
import Auth from '../utils/auth';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/mutations';
// SignupForm.tsx: Replace the addUser() functionality imported
//  from the API file with the ADD_USER mutation functionality.



const SignupForm = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [addUser, { error }] = useMutation(ADD_USER);

  const handleChange = (event: ChangeEvent) => {
    const { name, value } = event.target as HTMLInputElement;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  //submit form
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const { data } = await addUser({
        variables: { input:{...formState }},
      });

      Auth.login(data.addUser.token);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="flex-row justify-center mb-4">
      <div className="col-12 col-lg-10">
        <div className="card">
          <h4 className="card-header">Sign Up</h4>
          <div className="card-body">
            <Form onSubmit={handleFormSubmit}>
              <Form.Group>
                <Form.Label htmlFor="name">Name:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Your name"
                  name="name"
                  id="name"
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor="email">Email:</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Your email"
                  name="email"
                  id="email"
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label htmlFor="pwd">Password:</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Your password"
                  name="password"
                  id="pwd"
                  onChange={handleChange}
                />
              </Form.Group>
              <div className="flex-row justify-center">
                <Button type="submit">Submit</Button>
              </div>
            </Form>
            {error && (
              <div>
                <Alert variant="danger">{error.message}</Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );

};

export default SignupForm;






