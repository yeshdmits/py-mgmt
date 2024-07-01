import React, { createContext, useContext } from 'react';
const isDevEnv = import.meta.env.DEV;
const ApiContext = createContext(null);

export const APP_URL = isDevEnv ? "127.0.0.1:4321" : "";
const full_app_url = isDevEnv ? 'http://' + APP_URL : "";

export const useApi = () => {
    return useContext(ApiContext);
};

export const ApiProvider = ({ children }) => {
    const fetchGames = async () => {
        return fetch(full_app_url + '/api/list')
            .then(response => response.json())
            .catch(error => console.error('Error fetching data from REST API:', error))
    }
    const fetchGame = async (id) => {
        return fetch(full_app_url + '/api/game/' + id)
            .then(response => response.json())
            .catch(error => console.error('Error fetching data from REST API:', error))
    }
    return (
        <ApiContext.Provider value={{ fetchGames, fetchGame }}>
            {children}
        </ApiContext.Provider>
    );
};