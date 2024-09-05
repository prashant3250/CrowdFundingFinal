// pages/profile.js

import React, { useState, useEffect } from 'react';
import { Form, Button, Message, Container } from 'semantic-ui-react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Router } from '../routes';
import { useRouter } from 'next/router'; // Import useRouter from next/router

const Profile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        setName(response.data.user.name);
        setEmail(response.data.user.email);
      } catch (err) {
        if (err.response.status === 401) {
          Router.pushRoute('/login'); // Redirect to login if unauthorized
        } else {
          setError('Failed to load profile.');
        }
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/profile', { name });
      setSuccess(response.data.message);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');  // Call the logout endpoint
      Router.pushRoute('/login');  // Redirect to login page after logout
    } catch (err) {
      setError('Failed to log out.');
    }
  };

  const handleBack = () => {
    router.back(); // Navigate back to the previous page
  };

  return (
    <Layout>
      <Container>
        <h3>Profile</h3>
        <Form onSubmit={handleSubmit} error={!!error} success={!!success}>
          <Form.Field>
            <label>Email</label>
            <input 
              value={email}
              readOnly
            />
          </Form.Field>
          <Form.Field>
            <label>Name</label>
            <input 
              placeholder="Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Field>
          <Message error header="Oops!" content={error} />
          <Message success header="Success!" content={success} />
          <Button primary type="submit">Update Profile</Button>
          <Button color="red" onClick={handleLogout}>Logout</Button>
          <Button onClick={handleBack} secondary>Back</Button> {/* Back Button */}
        </Form>
      </Container>
    </Layout>
  );
};

export default Profile;
