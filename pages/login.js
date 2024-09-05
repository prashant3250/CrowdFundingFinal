import React, { useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Router } from '../routes';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    try {
      await axios.post('/api/login', { email, password });
      Router.pushRoute('/profile');  // Redirect to profile after successful login
    } catch (err) {
      setError(err.response.data.error || 'Something went wrong.');
    }
  };

  return (
    <Layout>
      <h3>Login</h3>
      <Form onSubmit={handleSubmit} error={!!error}>
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
        <Button primary type="submit">Login</Button>
      </Form>
    </Layout>
  );
};

export default Login;
