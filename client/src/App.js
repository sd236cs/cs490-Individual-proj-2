import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {

    const [topFilms, setTopFilms] = useState([]);
    const [showTopFilms, setShowTopFilms] = useState(false);

    const [selectedFilm, setSelectedFilm] = useState(null);
    const [showFilmDetails, setShowFilmDetails] = useState(false);

    const [storeId, setStoreId] = useState(""); // Store ID input from user
    const [topActors, setTopActors] = useState([]); // Top 5 actors in the store
    const [errorMessage3, setErrorMessage3] = useState(""); // Error message
    const [showTopActors, setShowTopActors] = useState(false); // Toggle actor list display

    //for feature 4
    const [fullName, setFullName] = useState(""); // Stores full name (first and last)
    const [actorDetails, setActorDetails] = useState(null); // Actor's details
    const [actorNames, setActorNames] = useState([]); // List of actor names for the datalist
    const [showResults, setShowResults] = useState(false); // Toggle results display
    const [errorMessage, setErrorMessage] = useState(""); // Error message


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
            setErrorMessage3(""); // Clear error messages on successful fetch
        } catch (error) {
            console.error("Error fetching top actors:", error);
            setErrorMessage3("Unable to fetch top actors for this store. Please try again.");
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

    //feature 4
    useEffect(() => {
        const fetchActorNames = async () => {
            try {
                const response = await axios.get("http://localhost:5000/actors-list");
                setActorNames(response.data); // Save actor names to state
            } catch (error) {
                console.error("Error fetching actor names:", error);
            }
        };

        fetchActorNames();
    }, []);


    // Handle the search for actor details
    const handleSearch = async (e) => {
        e.preventDefault(); // Prevent page reload
        setErrorMessage(""); // Clear any previous error
        setActorDetails(null);
        setTopFilms([]);

        if (!fullName.trim()) {
            setErrorMessage("Please enter an actor's full name.");
            return;
        }

        try {
            // Fetch actor details
            const actorResponse = await axios.get("http://localhost:5000/actor-details", {
                params: { fullName },
            });

            setActorDetails(actorResponse.data); // Save actor details

            // Fetch actor's top films using the actor's ID
            const topFilmsResponse = await axios.get(
                `http://localhost:5000/actor-top-films/${actorResponse.data.actor_id}`
            );

            setTopFilms(topFilmsResponse.data); // Save top films
            setShowResults(true); // Show results
        } catch (error) {
            console.error("Error fetching actor details or films:", error);

            if (error.response) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("An error occurred. Please try again.");
            }
        }
    };

    // Handle hiding the results
    const handleHideResults = () => {
        setShowResults(false);
        setActorDetails(null);
        setTopFilms([]);
    };

    return (
        <div className="App">
            <h1>Landing Page</h1>
            {/* Menu */}

            {/* FEATURE 1&2 */}
            <h2>Top 5 Rented Films</h2>
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
                    placeholder="Enter Store ID"
                />
                <button type="submit">Fetch Data</button>
            </form>

            <button
                onClick={() => {
                    setShowTopActors(!showTopActors);
                    if (!showTopActors) {
                        setErrorMessage3(""); // Reset any error messages when showing actors
                    }
                }}
            >
                {showTopActors ? "Hide Top Actors" : "Show Top Actors"}
            </button>

            {errorMessage3 && <p style={{ color: "red" }}>{errorMessage3}</p>}


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

            {/* FEATURE 4 */}
            <h2>Search Actor Details and Top Films</h2>

            {/* Search Form */}
            <form onSubmit={handleSearch}>
                <label htmlFor="fullName">Actor Name: </label>
                <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name (e.g., Tom Cruise)"
                    required
                    list="actors-list-datalist"
                />
                <br />
                <datalist id="actors-list-datalist">
                    {actorNames.map((actor, index) => (
                        <option
                            key={index}
                            value={`${actor.first_name} ${actor.last_name}`}
                        />
                    ))}
                </datalist>
                <button type="submit">Search</button>
            </form>

            {/* Dynamic datalist for autocomplete */}

            {/* Error Message */}
            {errorMessage && <p className="error">{errorMessage}</p>}

            {/* Actor Details */}
            {showResults && actorDetails && (
                <div>
                    <h2>Actor Details:</h2>
                    <p>
                        <strong>Actor ID:</strong> {actorDetails.actor_id}
                    </p>
                    <p>
                        <strong>Name:</strong> {actorDetails.first_name}{" "}
                        {actorDetails.last_name}
                    </p>
                </div>
            )}

            {/* Top 5 Rented Films */}
            {showResults && topFilms.length > 0 && (
                <div>
                    <h2>Top 5 Most Rented Films:</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>Film ID</th>
                            <th>Title</th>
                            <th>Rental Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topFilms.map((film) => (
                            <tr key={film.film_id}>
                                <td>{film.film_id}</td>
                                <td>{film.title}</td>
                                <td>{film.rental_count}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Hide Results Button */}
            {showResults && (
                <button onClick={handleHideResults} style={{ marginTop: "20px" }}>
                    Hide Results
                </button>
            )}
        </div>
    );
}

export default App;
