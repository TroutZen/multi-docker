import React from 'react';
import axios from 'axios';

// testing asdfasdf

const Fib = () => {
    const [seenIndices, setSeenIndices] = React.useState([]);
    const [values, setValues] = React.useState({});
    const [index, setIndex] = React.useState('');

    const fetchValues = React.useCallback(async () => {
        const values = await axios.get('/api/values/current');
        setValues(values.data);
    }, [setValues]);

    const fetchIndices = React.useCallback(async () => {
        const indices = await axios.get('/api/values/all');
        setSeenIndices(indices.data);
    }, [setSeenIndices]);

    React.useEffect(() => {
        fetchValues();
        fetchIndices();
        // Just do this on mount...

        //eslint-disable-next-line
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await axios.post('/api/values', {
            index,
        });

        setIndex('');
    }

    const renderSeenIndices = () => {
        return (seenIndices.map(({ number }) => {
            return number;
        })).join(', ');
    }

    const renderValues = () => {
        return  Object.keys(values).map((value) => {
            return (
                <div key={value}>
                    For index {value} I calced {values[value]}
                </div>
            );
        });
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Enter your index (hehe):</label>
                <input value={index} onChange={event => setIndex(event.target.value)} />
                <button>Submit</button>
            </form>
            <h3>Indexes I have seen:</h3>
            {renderSeenIndices()}
            <h3>Calculated values:</h3>
            {renderValues()}
        </div>
    );
};

export default Fib