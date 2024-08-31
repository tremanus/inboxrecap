"use client";
import { useState, useEffect } from 'react';
import './designtest.css'; // Import the CSS file

export default function Settings() {
    const [summaryTime, setSummaryTime] = useState('');
    const [category, setCategory] = useState('');
    const [currentSummaryTime, setCurrentSummaryTime] = useState('');
    const [currentCategory, setCurrentCategory] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Helper function to convert 24-hour time to 12-hour time with AM/PM
    const convertTo12HourFormat = (time24) => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 || 12; // Convert to 12-hour format
        const formattedMinute = minutes.toString().padStart(2, '0');
        return `${formattedHour}:${formattedMinute} ${period}`;
    };

    useEffect(() => {
        // Fetch the current settings when the component mounts
        const fetchCurrentSettings = async () => {
            try {
                const response = await fetch('/api/get-user-preferences'); // Use the correct API endpoint
                const data = await response.json();
                if (response.ok && data.summary_time && data.categories) {
                    const formattedSummaryTime = convertTo12HourFormat(data.summary_time);
                    setCurrentSummaryTime(formattedSummaryTime);
                    setCurrentCategory(data.categories[0]); // Assuming it's an array and we're interested in the first item
                    setSummaryTime(formattedSummaryTime);
                    setCategory(data.categories[0]);
                } else {
                    throw new Error('Failed to fetch current settings');
                }
            } catch (error) {
                console.error('Error fetching current settings:', error);
                setError('Could not retrieve current settings');
            }
        };

        fetchCurrentSettings();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setMessage('');
        setError('');
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        // Convert the time back to 24-hour format for submission
        const [time, period] = summaryTime.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const hours24 = period === 'PM' && hours < 12 ? hours + 12 : period === 'AM' && hours === 12 ? 0 : hours;
        const summaryTime24 = `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary_time: summaryTime24,
                    categories: [category], // Backend expects an array
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(result.message);
                setCurrentSummaryTime(summaryTime);
                setCurrentCategory(category);
                setIsEditing(false);
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

            {!isEditing ? (
                <div className="current-settings">
                    <p>Current Summary Time: {currentSummaryTime}</p>
                    <p>Current Category: {currentCategory}</p>
                    <button onClick={handleEdit} className="settings-button">
                        Edit
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSave} className="settings-form">
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
                        Save
                    </button>
                </form>
            )}
        </div>
    );
}
