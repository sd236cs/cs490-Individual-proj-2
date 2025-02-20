import React, { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {

    const [topFilms, setTopFilms] = useState([]);
    const [showTopFilms, setShowTopFilms] = useState(false);

    const [selectedFilm, setSelectedFilm] = useState(null);
    const [showFilmDetails, setShowFilmDetails] = useState(false);

    const [storeId, setStoreId] = useState(""); // Store ID input from user
    const [topActors, setTopActors] = useState([]); // Top 5 actors in the store
    const [errorMessage, setErrorMessage] = useState(""); // Error message

    const [showTopActors, setShowTopActors] = useState(false); // Toggle actor list display

    const handleInputChange = (e) => {
        setStoreId(e.target.value);
        setErrorMessage(""); // Clear any previous error messages
    };

    // Fetch top 5 actors for the provided Store ID
    const fetchTopActors = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/top-actors-in-store/${storeId}`);
            setTopActors(response.data);
            setShowTopActors(true);
            setErrorMessage(""); // Clear error messages on successful fetch
        } catch (error) {
            console.error("Error fetching top actors:", error);
            setErrorMessage("Unable to fetch top actors for this store. Please try again.");
            setShowTopActors(false);
            setTopActors([]); // Clear actors on error
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload
        setErrorMessage(""); // Reset error message
        if (!storeId) {
            setErrorMessage("Please enter a valid Store ID.");
            return;
        }

        fetchTopActors();
    };

    // Function to fetch top 5 rented films
    const fetchTopFilms = async () => {
        try {
            const response = await axios.get("http://localhost:5000/top5");
            setTopFilms(response.data);
            setShowTopFilms(!showTopFilms);
        } catch (error) {
            console.error("Error fetching top 5 rented films:", error);
        }
    };

    const fetchFilmDetails = async (filmId) => {
        try {
            const response = await axios.get(`http://localhost:5000/film/${filmId}`);
            setSelectedFilm(response.data);
            setShowFilmDetails(true);
        } catch (error) {
            console.error("Error fetching film details:", error);
        }
    };

    return (
        <div className="App">
            <h1>Landing Page</h1>

            {/* Button to fetch top films */}
            <button onClick={fetchTopFilms}>
                {showTopFilms ? "Hide Top 5 Films" : "Show Top 5 Films"}
            </button>
            {showTopFilms && (
                <table>
                    <thead>
                    <tr>
                        <th>Film ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Rented Count</th>
                    </tr>
                    </thead>
                    <tbody>
                    {topFilms.map((film) => (
                        <tr key={film.film_id} onClick={() => fetchFilmDetails(film.film_id)} style={{ cursor: "pointer" }}>
                            <td>{film.film_id}</td>
                            <td>{film.title}</td>
                            <td>{film.category}</td>
                            <td>{film.rented}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
            {/* Modal for Film Details */}
            {showFilmDetails && selectedFilm && (
                <div className="modal">
                    <div className="modal-content">
                        <span
                            className="close"
                            onClick={() => setShowFilmDetails(false)} // Close modal
                        >
                            &times;
                        </span>
                        <h2>{selectedFilm.title}</h2>
                        <p><strong>Description:</strong> {selectedFilm.description}</p>
                        <p><strong>Rating:</strong> {selectedFilm.rating}</p>
                        <p><strong>Category:</strong> {selectedFilm.category}</p>
                    </div>
                </div>
            )}
            <h2>Top Actors by Store</h2>

            {/* Form for inputting Store ID */}
            <form onSubmit={handleSubmit}>
                <label htmlFor="storeId">Enter Store ID: </label>
                <input
                    id="storeId"
                    type="text"
                    value={storeId}
                    onChange={handleInputChange}
                    placeholder="e.g., 1"
                />
                <button type="submit">Fetch Data</button>
            </form>
            {errorMessage && <p className="error">{errorMessage}</p>}

            {/* Top Actors Table */}
            {showTopActors && topActors.length > 0 && (
                <div>
                    <h2>Top 5 Actors in Store {storeId}:</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Actor ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Film Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topActors.map((actor) => (
                            <tr key={actor.actor_id}>
                                <td>{actor.actor_id}</td>
                                <td>{actor.first_name}</td>
                                <td>{actor.last_name}</td>
                                <td>{actor.film_count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default App;
