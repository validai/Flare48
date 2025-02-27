import React, { useState, useEffect } from 'react';

const NewsPage = () => {
  const [time, setTime] = useState('');
  const [weather, setWeather] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      setTime(date.toLocaleTimeString());
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    setWeather('Sunny, 72°F');
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to the News Page</h1>
      <p className="mt-4 text-lg text-gray-600">
        Here are the latest trending news articles from the past 48 hours.
      </p>

      <div className="mt-8 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Current Time</h3>
          <p className="text-xl">{time}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Weather</h3>
          <p className="text-xl">{weather}</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Latest Articles</h3>
      </div>
    </div>
  );
};

export default NewsPage;
