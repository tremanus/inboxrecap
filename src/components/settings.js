"use client";
import { useState } from 'react';
import './designtest.css'; // Import the CSS file

async function fetchUserEmail() {
    try {
        const response = await fetch('/api/get-user-email');
        const data = await response.json();
        if (response.ok && data.email) {
            return data.email;
        } else {
            throw new Error('Failed to fetch user email');
        }
    } catch (error) {
        console.error('Error fetching user email:', error);
        throw new Error('Could not retrieve user email');
    }
}

export default function Settings() {
    const [summaryTime, setSummaryTime] = useState('09:00 AM');
    const [category, setCategory] = useState('All Mail');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        try {
            const user_email = await fetchUserEmail();
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary_time: summaryTime,
                    categories: [category], // Assuming backend expects an array
                    user_id: user_email, // Remove if not needed
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(result.message);
            } else {
                setError(result.error || 'An unexpected error occurred.');
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        }
    };

    // Generate time options at 30-minute intervals in 12-hour format with AM/PM
    const generateTimeOptions = () => {
        const times = [];
        const formatTime = (hour, minute) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12; // Convert to 12-hour format
            const formattedMinute = minute.toString().padStart(2, '0');
            return `${formattedHour}:${formattedMinute} ${period}`;
        };

        for (let hour = 0; hour < 24; hour++) {
            times.push(formatTime(hour, 0));
            times.push(formatTime(hour, 30));
        }

        return times;
    };

    return (
        <div className="settings-container">
            <h2 className="settings-header">User Settings</h2>
            {error && <p className="settings-error">{error}</p>}
            {message && <p className="settings-message">{message}</p>}
            <form onSubmit={handleSubmit} className="settings-form">
                <div className="settings-form-group">
                    <label className="settings-label">
                        Summary Time:
                        <select
                            value={summaryTime}
                            onChange={(e) => setSummaryTime(e.target.value)}
                            className="settings-select"
                        >
                            {generateTimeOptions().map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="settings-form-group">
                    <label className="settings-label">
                        Categories:
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="settings-select"
                        >
                            <option value="All Mail">All Mail</option>
                            <option value="Promotions">Promotions</option>
                            <option value="Social">Social</option>
                            <option value="Updates">Updates</option>
                        </select>
                    </label>
                </div>
                <button type="submit" className="settings-button">
                    Update
                </button>
            </form>
        </div>
    );
}
