import React, { useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Router } from '../routes';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/register', { email, password, name });
      setSuccess(response.data.message);
      Router.pushRoute('/profile');  // Redirect to profile after successful registration
    } catch (err) {
      setError(err.response.data.error || 'Something went wrong.');
    }
  };

  return (
    <Layout>
      <h3>Register</h3>
      <Form onSubmit={handleSubmit} error={!!error} success={!!success}>
        <Form.Field>
          <label>Name</label>
          <input 
            placeholder="Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>Email</label>
          <input 
            placeholder="Email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <input 
            placeholder="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Field>
        <Message error header="Oops!" content={error} />
        <Message success header="Success!" content={success} />
        <Button primary type="submit">Register</Button>
      </Form>
    </Layout>
  );
};

export default Register;
