import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { distanceMap } from './distanceMap';
import styles from './delivery-rates.module.css'; // Ensure this path is correct
import Link from 'next/link'; // Import Link from Next.js

const predefinedAddresses = Object.keys(distanceMap).map((address) => ({
  value: address,
  label: address,
}));

export default function DeliveryRates() {
  const [fromAddress, setFromAddress] = useState<{ value: string; label: string } | null>(null);
  const [toAddress, setToAddress] = useState<{ value: string; label: string } | null>(null);
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    if (fromAddress && toAddress && distanceMap[fromAddress.value]) {
      const distance = distanceMap[fromAddress.value][toAddress.value];
      if (typeof distance === 'number') {
        // If it's a number, set it directly
        setRate(distance);
      } else if (typeof distance === 'string') {
        // If it's a string range, calculate the average
        const [min, max] = distance.split('-').map(Number);
        const average = (min + max) / 2;
        setRate(average);
      } else {
        setRate(null);
      }
    } else {
      setRate(null);
    }
  }, [fromAddress, toAddress]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Instant Pickup and Delivery Rates</h1>

      <div className={styles.inputWrapper}>
        <label className={styles.label} htmlFor="from">From Address</label>
        <Select
          id="from"
          name="from"
          className={styles.selectField}
          options={predefinedAddresses}
          value={fromAddress}
          onChange={(selected) => setFromAddress(selected ? selected as { value: string; label: string } : null)}
          placeholder="Select from address..."
        />
      </div>

      <div className={styles.inputWrapper}>
        <label className={styles.label} htmlFor="to">To Address</label>
        <Select
          id="to"
          name="to"
          className={styles.selectField}
          options={predefinedAddresses}
          value={toAddress}
          onChange={(selected) => setToAddress(selected ? selected as { value: string; label: string } : null)}
          placeholder="Select to address..."
        />
      </div>

      {rate !== null && (
        <div className={styles.rateDisplay}>
          <p>Delivery Rate from {fromAddress?.label} to {toAddress?.label} is: ₹{rate}</p>
        </div>
      )}
      <br/><br/><br/><br/><br/><br/><br/><br/>

      {/* Fixed the Link component */}
      <div>
        <h2>Visit the link below to check delivery rates for addresses other than the ones we provided.</h2>
      </div><br/>
      <div>
        <Link href="/instant.pdf" className={styles.links}>Instant delivery rate outside Imphal</Link>
      </div>

      <div>
        <Link href="/stand.pdf" className={styles.links}>Standard delivery rates</Link>
      </div><br/><br/><br/>
      <div>
        <p>&quot;For more information please contact to our Whatsapp number 8787649928&quot;</p>
      </div>
    </div>
  );
}
