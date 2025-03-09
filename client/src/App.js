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

    //for feature 5
    const [searchInput, setSearchInput] = useState(""); // Search term input from the user
    const [searchCategory, setSearchCategory] = useState("title"); // Default category is title
    const [searchResults, setSearchResults] = useState([]); // Results from the search
    const [searchError, setSearchError] = useState(""); // Error during search
    const [showSearchResults, setShowSearchResults] = useState(false); // Toggle search results display

    //feature 7
    /* const [movieIdentifier, setMovieIdentifier] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [staffId, setStaffId] = useState("");
    const [message, setMessage] = useState(""); */

    //feature 8
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    //feature 9
    const [searchCustomerId, setSearchCustomerId] = useState("");
    const [searchFirstName, setSearchFirstName] = useState("");
    const [searchLastName, setSearchLastName] = useState("");
    const [searchResults9, setSearchResults9] = useState([]);
    const [searchError9, setSearchError9] = useState("");

    //feature 10
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [addressId, setAddressId] = useState("");
    const [active, setActive] = useState(1);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    //feature 11
    const [editCustomer, setEditCustomer] = useState(null); // Customer being edited
    const [editFormVisible, setEditFormVisible] = useState(false);

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

    //feature 5

    const handleSearch5 = async (e) => {
        e.preventDefault(); // Prevent page reload
        setSearchError(""); // Reset any previous error message
        setSearchResults([]); // Clear previous results
        setShowSearchResults(false); // Hide previous results during a new search

        if (!searchInput.trim()) {
            setSearchError("Please enter a search term.");
            return;
        }

        try {
            const response = await axios.get("http://localhost:5000/search-films", {
                params: {
                    query: searchInput, // Search input
                    category: searchCategory, // Search category (title, actor, genre)
                },
            });

            if (response.data.length === 0) {
                setSearchError("No results found for your search.");
            } else {
                setSearchResults(response.data);
                setShowSearchResults(true);
            }
        } catch (error) {
            console.error("Error performing search:", error);
            setSearchError("An error occurred during the search. Please try again.");
        }
    };

    //feature 7
    /*const handleRentMovie = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await axios.post("http://localhost:5000/rent-movie",
                {
                    inventoryId: movieIdentifier.match(/^\d+$/) ? movieIdentifier : null,
                    movieName: isNaN(movieIdentifier) ? movieIdentifier : null,
                    customerId: customerId,
                    staffId: staffId,
                },
                {
                    headers: {
                        "Content-Type": "application/json", // Ensure this header is set
                    },
                }
            );


            setMessage(response.data.message);
        } catch (error) {
            if (error.response) {
                setMessage(error.response.data.error || "Error occurred while renting the movie.");
            } else {
                setMessage("Error occurred while contacting the server.");
            }
        }
    }; */

    //feature 8

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/customers", {
                params: { page: currentPage },
            });
            setCustomers(response.data.customers);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [currentPage]);

    //feature 9

    const handleCustSearch = async () => {
        try {
            const response = await axios.get("http://localhost:5000/search-customers", {
                params: {
                    customerId: searchCustomerId,
                    firstName: searchFirstName,
                    lastName: searchLastName,
                },
            });
            setSearchResults9(response.data);
            setSearchError9("");
        } catch (error) {
            console.error("Error searching customers:", error);
            setSearchError9("Error searching customers. Please try again.");
            setSearchResults9([]);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    //feature 10

    const handleSubmit10 = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            /*console.log({
                firstName,
                lastName,
                email,
                addressId,
                storeId,
                active,
            }); */

            const response = await axios.post("http://localhost:5000/customers", {
                firstName,
                lastName,
                email,
                addressId,
                storeId,
                active,
            });

            setMessage(response.data.message);
            setFirstName("");
            setLastName("");
            setEmail("");
            setAddressId("");
            setStoreId("");
            setActive(1);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error);
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    };

    //feature 11

    const handleEditCustomer = async (customerId) => {
        try {
            const response = await axios.get(`http://localhost:5000/customers/${customerId}`);
            setEditCustomer(response.data[0]);
            setEditFormVisible(true);
        } catch (error) {
            console.error("Error fetching customer details:", error);
        }
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        try {
            //console.log("Before put request in handleUpdateCustomer:", editCustomer);
            await axios.put(`http://localhost:5000/customers/${editCustomer.customer_id}`, editCustomer);
            setEditFormVisible(false);
            await fetchCustomers(); // Refresh customer list
        } catch (error) {
            console.error("Error updating customer:", error);
        }
    };

    const handleInputChangeEdit = (e) => {
        //console.log("Name:", e.target.name, "Value:", e.target.value);
        setEditCustomer((prevCustomer) => {
            const updatedCustomer = {
                ...prevCustomer,
                [e.target.name]: e.target.value,
            };
            //console.log("Updated Customer:", updatedCustomer);
            return updatedCustomer;
        });
    };

    return (
        <div className="App">
            <h1>Landing Page</h1>

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

            {/* FEATURE 5 */}
            {/* Film Search Section */}
            <div className="search-section">
                <h2>Search Films</h2>
                <form onSubmit={handleSearch5}>
                    <label>
                        Search Term:
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Enter film title, actor, or genre"
                        />
                    </label>
                    <label>
                        Category:
                        <select
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                        >
                            <option value="title">Film Title</option>
                            <option value="actor">Actor Name</option>
                            <option value="genre">Genre</option>
                        </select>
                    </label>
                    <button type="submit">Search</button>
                </form>

                {/* Error Message */}
                {searchError && <p className="error">{searchError}</p>}

                {/* Search Results */}
                {showSearchResults && (
                    <div className="search-results">
                        <h3>Search Results:</h3>
                        {/* Button to hide search results */}
                        <button onClick={() => setShowSearchResults(false)}>Hide Results</button>
                        <ul>
                            {searchResults.map((film) => (
                                <li key={film.film_id}>
                                    <a
                                        href="#"
                                        className="film-title-link"
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent default anchor behavior
                                            fetchFilmDetails(film.film_id); // Fetch movie details
                                        }}
                                    >
                                        {film.title}
                                    </a>
                                    {film.genre && ` - Genre: ${film.genre}`} {/* Add more details if needed */}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* Modal for Film Details */}
                {showFilmDetails && selectedFilm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button
                                className="close-modal-button"
                                onClick={() => setShowFilmDetails(false)}
                            >
                                Close
                            </button>
                            {/* Display Selected Film Details */}
                            <h3>{selectedFilm.title}</h3>
                            <p><strong>Genre:</strong> {selectedFilm.category}</p>
                            <p><strong>Description:</strong> {selectedFilm.description}</p>
                            <p><strong>Release Year:</strong> {selectedFilm.release_year}</p>
                            <p><strong>Rating:</strong> {selectedFilm.rating}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* FEATURE 7 */}
            {/*
            <div className="rent-movie-section">
                <h2>Rent a Movie</h2>
                <form onSubmit={handleRentMovie}>
                    <div>
                        <label>Movie Inventory ID or Name:</label>
                        <input
                            type="text"
                            value={movieIdentifier}
                            onChange={(e) => setMovieIdentifier(e.target.value)}
                            placeholder="Enter inventory ID or movie name"
                            required
                        />
                    </div>
                    <div>
                        <label>Customer ID:</label>
                        <input
                            type="number"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            placeholder="Enter customer ID"
                            required
                        />
                    </div>
                    <div>
                        <label>Staff ID:</label>
                        <input
                            type="number"
                            value={staffId}
                            onChange={(e) => setStaffId(e.target.value)}
                            placeholder="Enter staff ID"
                            required
                        />
                    </div>
                    <button type="submit">Rent Movie</button>
                </form>
                {message && <p>{message}</p>}
            </div>*/}

            {/* FEATURE 8 & 11 */}
            <div className="Feature8">
                <h2>Customer List</h2>
                {loading && <p>Loading...</p>}
                {!loading && (
                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Email</th>
                                <th>Edit</th>
                            </tr>
                            </thead>
                            <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.customer_id}>
                                    <td>{customer.customer_id}</td>
                                    <td>{customer.first_name}</td>
                                    <td>{customer.last_name}</td>
                                    <td>{customer.email}</td>
                                    <td>
                                        <button onClick={() => handleEditCustomer(customer.customer_id)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="Pagination">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                Previous
                            </button>
                            <span>
                            Page {currentPage} of {totalPages}
                        </span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {editFormVisible && editCustomer && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Edit Customer</h2>
                        <form onSubmit={handleUpdateCustomer}>
                            <input type="text" name="first_name" value={editCustomer.first_name} onChange={handleInputChangeEdit} placeholder="First Name" />
                            <input type="text" name="last_name" value={editCustomer.last_name} onChange={handleInputChangeEdit} placeholder="Last Name" />
                            <input type="email" name="email" value={editCustomer.email} onChange={handleInputChangeEdit} placeholder="Email" />
                            <input type="number" name="address_id" value={editCustomer.address_id} onChange={handleInputChangeEdit} placeholder="Address ID" />
                            <input type="number" name="store_id" value={editCustomer.store_id} onChange={handleInputChangeEdit} placeholder="Store ID" />
                            <select name="active" value={editCustomer.active} onChange={handleInputChangeEdit}>
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                            <button type="submit">Update</button>
                            <button onClick={() => setEditFormVisible(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {/* FEATURE 9 */}
            <div className="feature9">
                <h2>Customer Search</h2>
                <div>
                    <input
                        type="text"
                        placeholder="Customer ID"
                        value={searchCustomerId}
                        onChange={(e) => setSearchCustomerId(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="First Name"
                        value={searchFirstName}
                        onChange={(e) => setSearchFirstName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={searchLastName}
                        onChange={(e) => setSearchLastName(e.target.value)}
                    />
                    <button onClick={handleCustSearch}>Search</button>
                </div>

                {searchError9 && <p style={{ color: "red" }}>{searchError9}</p>}

                {searchResults9.length > 0 && (
                    <table>
                        <thead>
                        <tr>
                            <th>Customer ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                        </tr>
                        </thead>
                        <tbody>
                        {searchResults9.map((customer) => (
                            <tr key={customer.customer_id}>
                                <td>{customer.customer_id}</td>
                                <td>{customer.first_name}</td>
                                <td>{customer.last_name}</td>
                                <td>{customer.email}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* FEATURE 10 */}

            <div>
                <h2>Add New Customer</h2>
                <form onSubmit={handleSubmit10}>
                    <div>
                        <label>First Name:</label>
                        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Last Name:</label>
                        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label>Address ID:</label>
                        <input type="number" value={addressId} onChange={(e) => setAddressId(e.target.value)} />
                    </div>
                    <div>
                        <label>Store ID:</label>
                        <input type="number" value={storeId} onChange={(e) => setStoreId(e.target.value)} />
                    </div>
                    <div>
                        <label>Active:</label>
                        <select value={active} onChange={(e) => setActive(parseInt(e.target.value))}>
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>
                    <button type="submit">Add Customer</button>
                </form>

                {message && <p style={{ color: "green" }}>{message}</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>

            {/* FEATURE 12 */}


        </div>
    );
}
export default App;
