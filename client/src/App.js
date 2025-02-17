import React, { useState } from "react";

function App() {
    // State to store actors data
    const [actors, setActors] = useState([]);

    // Function to fetch actors data when the button is clicked
    const fetchActors = async () => {
        try {
            const response = await fetch("http://localhost:5000/actors");
            const data = await response.json();
            setActors(data); // Store actors data in the state
        } catch (error) {
            console.error("Error fetching actors:", error);
        }
    };

    return (
        <div className="App">
            <h1>Actors List</h1>
            {/* Button to trigger the fetch */}
            <button onClick={fetchActors}>Load Actors</button>

            {/* Only display the table if actors data is available */}
            {actors.length > 0 && (
                <table>
                    <thead>
                    <tr>
                        <th>Actor ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Last Update</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Render each actor in a table row */}
                    {actors.map((actor) => (
                        <tr key={actor.actor_id}>
                            <td>{actor.actor_id}</td>
                            <td>{actor.first_name}</td>
                            <td>{actor.last_name}</td>
                            <td>{actor.last_update}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default App;