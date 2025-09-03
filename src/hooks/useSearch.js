import { useState, useCallback, useRef, useEffect } from "react";
import { startSearchPrices, getSearchPrices, stopSearchPrices } from "../api";

export const useSearch = () => {
  const [searchState, setSearchState] = useState("idle");
  const [waitUntil, setWaitUntil] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const activeSearchToken = useRef(null);
  const activeTimers = useRef(new Set());

  const MAX_RETRIES = 2;

  useEffect(() => {
    return () => {
      activeTimers.current.forEach((timerId) => clearTimeout(timerId));
      activeTimers.current.clear();
    };
  }, []);

  const pollForResults = useCallback(
    async (token, waitUntilTime) => {
      if (activeSearchToken.current !== token) {
        return;
      }

      const waitTime = new Date(waitUntilTime).getTime() - Date.now();

      if (waitTime > 100) {
        const timerId = setTimeout(
          () => pollForResults(token, waitUntilTime),
          waitTime
        );
        activeTimers.current.add(timerId);
        return;
      }

      try {
        if (activeSearchToken.current !== token) {
          return;
        }

        const response = await getSearchPrices(token);
        const data = await response.json();

        if (activeSearchToken.current !== token) {
          return;
        }
        setSearchResults(data.prices);
        setSearchState("success");
        setWaitUntil(null);
        activeSearchToken.current = null;
      } catch (err) {
        if (activeSearchToken.current !== token) {
          return;
        }

        if (err.status === 425) {
          const timerId = setTimeout(
            () => pollForResults(token, waitUntilTime),
            1000
          );
          activeTimers.current.add(timerId);
        } else if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          const timerId = setTimeout(
            () => pollForResults(token, waitUntilTime),
            1000
          );
          activeTimers.current.add(timerId);
        } else {
          console.error("Max retries exceeded for token:", token);
          setSearchState("error");
          setError("Помилка отримання результатів. Спробуйте ще раз.");
          activeSearchToken.current = null;
        }
      }
    },
    [retryCount]
  );

  const cancelActiveSearch = useCallback(async () => {
    if (!activeSearchToken.current) {
      return;
    }

    const tokenToCancel = activeSearchToken.current;

    try {
      setIsCancelling(true);
      setSearchState("cancelling");

      await stopSearchPrices(tokenToCancel);

      activeTimers.current.forEach((timerId) => clearTimeout(timerId));
      activeTimers.current.clear();

      setWaitUntil(null);
      setRetryCount(0);
      setIsCancelling(false);
    } catch (err) {
      console.error("Error cancelling search:", err);
      setIsCancelling(false);
      activeTimers.current.forEach((timerId) => clearTimeout(timerId));
      activeTimers.current.clear();
      activeSearchToken.current = null;
      setWaitUntil(null);
      setRetryCount(0);
    }
  }, []);

  const restartSearchWithToken = useCallback(
    async (token) => {
      try {
        setSearchState("loading");
        setError(null);
        setRetryCount(0);

        activeSearchToken.current = token;

        pollForResults(token, new Date().toISOString());
      } catch (err) {
        console.error("Error restarting search with token:", err);
        setSearchState("error");
        setError("Помилка перезапуску пошуку. Спробуйте ще раз.");
        activeSearchToken.current = null;
      }
    },
    [pollForResults]
  );

  const startSearch = useCallback(
    async (countryID, hotelID = null, cityID = null) => {
      try {
        if (activeSearchToken.current) {
          await cancelActiveSearch();

          if (activeSearchToken.current) {
            return restartSearchWithToken(activeSearchToken.current);
          }
        }

        setSearchState("loading");
        setError(null);
        setRetryCount(0);

        const response = await startSearchPrices(countryID, hotelID, cityID);
        const data = await response.json();

        activeSearchToken.current = data.token;

        const waitUntilDate = new Date(data.waitUntil);
        const currentTime = new Date();

        if (waitUntilDate <= currentTime) {
          setWaitUntil(null);
          pollForResults(data.token, new Date().toISOString());
        } else {
          setWaitUntil(waitUntilDate);
          pollForResults(data.token, data.waitUntil);
        }
      } catch (err) {
        console.error("Error in startSearch:", err);
        setSearchState("error");
        setError("Помилка запуску пошуку. Спробуйте ще раз.");
        activeSearchToken.current = null;
      }
    },
    [pollForResults, cancelActiveSearch, restartSearchWithToken]
  );

  const resetSearch = useCallback(() => {
    activeSearchToken.current = null;
    activeTimers.current.forEach((timerId) => clearTimeout(timerId));
    activeTimers.current.clear();

    setSearchState("idle");
    setSearchResults(null);
    setError(null);
    setRetryCount(0);
    setWaitUntil(null);
    setIsCancelling(false);
  }, []);

  return {
    searchState,
    waitUntil,
    searchResults,
    error,
    isCancelling,
    startSearch,
    resetSearch,
    setError,
  };
};
