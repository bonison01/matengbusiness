import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { distanceMap } from './distanceMap';
import styles from './delivery-rates.module.css';
import Link from 'next/link';

// Fix the predefinedAddresses to match distanceMap keys exactly
const predefinedAddresses = Object.keys(distanceMap).map((address) => ({
  value: address,
  label: address,
}));

export default function DeliveryRates() {
  const [fromAddress, setFromAddress] = useState<{ value: string; label: string } | null>(null);
  const [toAddress, setToAddress] = useState<{ value: string; label: string } | null>(null);
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    if (fromAddress && toAddress && distanceMap[fromAddress.value]?.[toAddress.value] !== undefined) {
      const distance = distanceMap[fromAddress.value][toAddress.value];
      if (typeof distance === 'number') {
        setRate(distance);
      } else if (typeof distance === 'string') {
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
          onChange={(selected) => setFromAddress(selected)}
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
          onChange={(selected) => setToAddress(selected)}
          placeholder="Select to address..."
        />
      </div>

      {rate !== null && fromAddress && toAddress && (
        <div className={styles.rateDisplay}>
          <p>Delivery Rate from {fromAddress.label} to {toAddress.label} is: ₹{rate.toFixed(2)}</p>
        </div>
      )}

      <br/><br/><br/><br/><br/><br/><br/><br/>
      <div>
        <h2>Visit the link below to check delivery rates for addresses other than the ones we provided.</h2>
      </div><br/>
      <div>
        <Link href="/instant.pdf" className={styles.links}>Instant delivery rate outside Imphal</Link>
      </div>
      <div>
        <Link href="/standard.pdf" className={styles.links}>Standard delivery rates</Link>
      </div><br/><br/><br/>
      <div>
        <p>"For more information please contact our Whatsapp number 8787649928"</p>
      </div>
    </div>
  );
}