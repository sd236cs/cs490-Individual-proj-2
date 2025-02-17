import React, { useState, useEffect } from "react";

function App() {
    // State to store actors data
    const [actors, setActors] = useState([]);

    // Fetch actors data from backend API
    useEffect(() => {
        const fetchActors = async () => {
            try {
                const response = await fetch("http://localhost:5000/actors");
                const data = await response.json();
                setActors(data); // Store actors data in the state
            } catch (error) {
                console.error("Error fetching actors:", error);
            }
        };

        fetchActors(); // Fetch actors data when the component mounts
    }, []);

    return (
        <div className="App">
            <h1>Actors List</h1>
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
        </div>
    );
}

export default App;
