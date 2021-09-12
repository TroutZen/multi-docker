import React from 'react';
import { Link } from 'react-router-dom';

const OtherPage = () => {
    return (
        <div>
            some other page
            <Link to="/">Home</Link>
        </div>
    );
}

export default OtherPage;