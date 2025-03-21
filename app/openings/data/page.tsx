'use client';

import { supabase } from '../../../lib/supabaseClient'; // Adjust the path to your Supabase client
import React, { useEffect, useState } from 'react';
import styles from './JobOpenings.module.css'; // Import the CSS module

// Define the structure of your table's rows
interface JobOpening {
  id: number;
  name: string;
  email: string;
  position: string;
  resume_url: string;
  created_at: string; // Include created_at field
}

const JobOpeningsPage = () => {
  const [jobOpenings, setJobOpenings] = useState<JobOpening[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch job openings from the database
  const fetchJobOpenings = async () => {
    try {
      const { data, error } = await supabase.from('job_openings').select('*');

      if (error) {
        throw new Error(error.message);
      }

      setJobOpenings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    fetchJobOpenings();
  }, []);

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!jobOpenings) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Job Openings</h1>
      <ul className={styles.list}>
        {jobOpenings.map((job) => (
          <li key={job.id} className={styles.listItem}>
            <h2 className={styles.name}>{job.name}</h2>
            <p className={styles.detail}>Email: {job.email}</p>
            <p className={styles.detail}>Position: {job.position}</p>
            <p className={styles.detail}>Created At: {new Date(job.created_at).toLocaleString()}</p>
            {job.resume_url && (
              <a
                href={job.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                View Resume
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobOpeningsPage;
