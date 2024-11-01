import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import React from 'react';
import Auth from '../utils/auth';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/mutations';

interface SignUpFormProps {
  handleModalClose: () => void;
}

const SignupForm: React.FC<SignUpFormProps> = ({ handleModalClose }) => {
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [addUser, { error }] = useMutation(ADD_USER, {
    onCompleted(data) {
      // Login the user after successfully signing up
      Auth.login(data.addUser.token);
      handleModalClose(); // Close the modal upon successful signup
    },
  });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      [name]: value,
    });
  };

  // Submit form
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await addUser({
        variables:  { ...formState } ,
      });
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
                  name="username"
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
