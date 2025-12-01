
import React, { useState } from 'react';
import { AppUser } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ContactUsPageProps {
    user: AppUser;
}

const ContactUsPage: React.FC<ContactUsPageProps> = ({ user }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState(user.auth.email || '');
    const [subject, setSubject