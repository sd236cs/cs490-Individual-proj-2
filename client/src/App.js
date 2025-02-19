import React, { useState } from "react";
import "./App.css";
import axios from "axios";

function App() {

    const [topFilms, setTopFilms] = useState([]);
    const [showTopFilms, setShowTopFilms] = useState(false);

    const [selectedFilm, setSelectedFilm] = useState(null);
    const [showFilmDetails, setShowFilmDetails] = useState(false);

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

            <button onClick={fetchTopFilms}>{showTopFilms ? "Hide Top 5 Films" : "Show Top 5 Films"}</button>
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
        </div>
    );
}

export default App;
