// // src/contexts/ads/AdManager.js
// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { AppState } from "react-native";
// import { AppOpenAd, AdEventType, TestIds } from "react-native-google-mobile-ads";

// // ---------- CONFIG ----------
// const USE_TEST_ID_IN_DEV = true;
// const APP_OPEN_UNIT_ID = __DEV__ && USE_TEST_ID_IN_DEV
//   ? TestIds.APP_OPEN
//   : "ca-app-pub-4430730740679068/2694167477";

// // Timeout to wait for load (ms)
// const LOAD_TIMEOUT_MS = 6000;

// // Minimum interval between app-open shows (ms) to avoid spamming
// const MIN_SHOW_INTERVAL_MS = 90 * 1000; // 90 seconds

// // ---------- Context ----------
// const AdsContext = createContext({
//   showAppOpen: async () => false,
//   isAppOpenLoaded: false,
// });

// export function AdsProvider({ children, showAppOpenOnForeground = true }) {
//   const appState = useRef(AppState.currentState);
//   const appOpenAdRef = useRef(null);

//   // state flags
//   const [appOpenLoaded, setAppOpenLoaded] = useState(false);

//   // loading promise queue / resolver refs so callers can await loading
//   const loadingPromiseRef = useRef(null);
//   const loadingResolveRef = useRef(null);
//   const loadingRejectRef = useRef(null);

//   // last time we displayed an app open (ms)
//   const lastShownAtRef = useRef(0);

//   // create and manage App Open ad instance
//   useEffect(() => {
//     appOpenAdRef.current = AppOpenAd.createForAdRequest(APP_OPEN_UNIT_ID, {
//       // put request options here if needed
//     });

//     // listeners
//     const unsubLoaded = appOpenAdRef.current.addAdEventListener(
//       AdEventType.LOADED,
//       () => {
//         console.log("[AdManager] AppOpenAd loaded");
//         setAppOpenLoaded(true);
//         // resolve any pending loading promise
//         if (loadingResolveRef.current) {
//           loadingResolveRef.current(true);
//           loadingResolveRef.current = null;
//           loadingRejectRef.current = null;
//           loadingPromiseRef.current = null;
//         }
//       }
//     );

//     const unsubClosed = appOpenAdRef.current.addAdEventListener(
//       AdEventType.CLOSED,
//       () => {
//         console.log("[AdManager] AppOpenAd closed — reloading");
//         setAppOpenLoaded(false);
//         // reload for next time
//         try {
//           appOpenAdRef.current.load();
//         } catch (e) {
//           console.warn("[AdManager] reload error", e);
//         }
//       }
//     );

//     const unsubError = appOpenAdRef.current.addAdEventListener(
//       AdEventType.ERROR,
//       (err) => {
//         console.warn("[AdManager] AppOpenAd error", err);
//         setAppOpenLoaded(false);
//         // reject pending load
//         if (loadingRejectRef.current) {
//           loadingRejectRef.current(err);
//           loadingResolveRef.current = null;
//           loadingRejectRef.current = null;
//           loadingPromiseRef.current = null;
//         }
//         // try reload later
//         setTimeout(() => {
//           try {
//             appOpenAdRef.current?.load();
//           } catch (e) {
//             /* ignore */
//           }
//         }, 2000);
//       }
//     );

//     // initial load
//     try {
//       appOpenAdRef.current.load();
//       console.log("[AdManager] requested initial AppOpenAd load");
//     } catch (e) {
//       console.warn("[AdManager] initial load error", e);
//     }

//     return () => {
//       try {
//         unsubLoaded();
//         unsubClosed();
//         unsubError();
//       } catch (e) {
//         // ignore cleanup errors
//       }
//     };
//   }, []);

//   // helper: wait for load (returns Promise<boolean>)
//   const waitForLoad = () => {
//     // if already loaded, resolve immediately
//     if (appOpenLoaded) return Promise.resolve(true);

//     // if there's already a loading promise, return it
//     if (loadingPromiseRef.current) return loadingPromiseRef.current;

//     // else create a new promise and start load
//     loadingPromiseRef.current = new Promise((resolve, reject) => {
//       loadingResolveRef.current = resolve;
//       loadingRejectRef.current = reject;

//       // request load (if not already requested)
//       try {
//         console.log("[AdManager] calling load() for AppOpenAd (waitForLoad)");
//         appOpenAdRef.current?.load();
//       } catch (e) {
//         console.warn("[AdManager] load() call failed", e);
//         reject(e);
//         loadingResolveRef.current = null;
//         loadingRejectRef.current = null;
//         loadingPromiseRef.current = null;
//       }

//       // timeout safety
//       const t = setTimeout(() => {
//         if (loadingRejectRef.current) {
//           loadingRejectRef.current(new Error("AppOpenAd load timeout"));
//           loadingResolveRef.current = null;
//           loadingRejectRef.current = null;
//           loadingPromiseRef.current = null;
//         }
//       }, LOAD_TIMEOUT_MS);

//       // wrap resolve/reject to clear timeout
//       const origResolve = loadingResolveRef.current;
//       const origReject = loadingRejectRef.current;
//       loadingResolveRef.current = (val) => {
//         clearTimeout(t);
//         origResolve && origResolve(val);
//       };
//       loadingRejectRef.current = (err) => {
//         clearTimeout(t);
//         origReject && origReject(err);
//       };
//     });

//     return loadingPromiseRef.current;
//   };

//   // Public API: showAppOpen — waits for load (with timeout) then shows
//   const showAppOpen = async () => {
//     try {
//       // simple rate-limit
//       const now = Date.now();
//       if (now - lastShownAtRef.current < MIN_SHOW_INTERVAL_MS) {
//         console.log("[AdManager] showAppOpen skipped (rate limit)");
//         return false;
//       }

//       if (!appOpenAdRef.current) {
//         console.warn("[AdManager] showAppOpen: no ad instance");
//         return false;
//       }

//       if (!appOpenLoaded) {
//         // wait for load (or timeout)
//         try {
//           const loaded = await waitForLoad();
//           if (!loaded) {
//             console.warn("[AdManager] showAppOpen: ad did not load in time");
//             return false;
//           }
//         } catch (err) {
//           console.warn("[AdManager] showAppOpen: load failed", err);
//           return false;
//         }
//       }

//       // show and update lastShown
//       try {
//         appOpenAdRef.current.show();
//         lastShownAtRef.current = Date.now();
//         // After show, the CLOSED listener will reload automatically
//         return true;
//       } catch (e) {
//         console.warn("[AdManager] showAppOpen error", e);
//         return false;
//       }
//     } catch (err) {
//       console.warn("[AdManager] showAppOpen unexpected error", err);
//       return false;
//     }
//   };

//   // Show app-open on app foreground transitions (if enabled)
//   useEffect(() => {
//     if (!showAppOpenOnForeground) return;

//     const handleAppStateChange = (nextAppState) => {
//       if (appState.current.match(/inactive|background/) && nextAppState === "active") {
//         // try to show, but showAppOpen handles readiness/rate-limit
//         showAppOpen().then((shown) =>
//           console.log("[AdManager] app-foreground showAppOpen result:", shown)
//         );
//       }
//       appState.current = nextAppState;
//     };

//     const subscription = AppState.addEventListener("change", handleAppStateChange);
//     return () => {
//       try {
//         subscription.remove();
//       } catch {
//         if (typeof subscription === "function") subscription();
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showAppOpenOnForeground, appOpenLoaded]);

//   const ctxValue = {
//     showAppOpen,
//     isAppOpenLoaded: appOpenLoaded,
//   };

//   return <AdsContext.Provider value={ctxValue}>{children}</AdsContext.Provider>;
// }

// export function useAds() {
//   return useContext(AdsContext);
// }

// src/contexts/ads/AdManager.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import {
  AppOpenAd,
  RewardedInterstitialAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

// ---------- CONFIG ----------
const USE_TEST_ID_IN_DEV = true;

// App Open unit (test in dev)
const APP_OPEN_UNIT_ID =
  __DEV__ && USE_TEST_ID_IN_DEV
    ? TestIds.APP_OPEN
    : "ca-app-pub-4430730740679068/3725774004";

// Rewarded interstitial unit (use your provided production ID)
const REWARDED_INTERSTITIAL_UNIT_ID =
  __DEV__ && USE_TEST_ID_IN_DEV
    ? TestIds.REWARDED_INTERSTITIAL
    : "ca-app-pub-4430730740679068/3204682210";

// Timeouts & limits
const LOAD_TIMEOUT_MS = 6000;
const MIN_SHOW_INTERVAL_MS = 90 * 1000; // 90s between app-open shows

// ---------- Context ----------
const AdsContext = createContext({
  showAppOpen: async () => false,
  showRewardedInterstitial: async () => ({ earned: false, reward: null }),
  isAppOpenLoaded: false,
  isRewardedLoaded: false,
  isAdsRemoved: false,
  removeAds: async () => {},
  restorePurchases: async () => false,
});

export function AdsProvider({ children, showAppOpenOnForeground = true }) {
  const appState = useRef(AppState.currentState);

  // AppOpen refs/state
  const appOpenAdRef = useRef(null);
  const [appOpenLoaded, setAppOpenLoaded] = useState(false);
  const loadingPromiseAppOpenRef = useRef(null);
  const loadingResolveAppOpenRef = useRef(null);
  const loadingRejectAppOpenRef = useRef(null);
  const lastAppOpenShownAtRef = useRef(0);

  // Rewarded Interstitial refs/state
  const rewardedAdRef = useRef(null);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);
  const loadingPromiseRewardedRef = useRef(null);
  const loadingResolveRewardedRef = useRef(null);
  const loadingRejectRewardedRef = useRef(null);
  // pending show promise resolve/reject and flag for reward
  const pendingRewardResolveRef = useRef(null);
  const pendingRewardRejectRef = useRef(null);
  const pendingRewardGrantedRef = useRef(false);
  const pendingRewardObjectRef = useRef(null);

  // --- new: ads removed state
  const [isAdsRemoved, setIsAdsRemoved] = useState(false);
  const loadingAdsRemovedRef = useRef(false);

  const isShowingRewardedRef = useRef(false);
  const rewardedShowTimeoutRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const val = await AsyncStorage.getItem(ADS_REMOVED_KEY);
        if (val === "1") {
          setIsAdsRemoved(true);
        } else {
          setIsAdsRemoved(false);
        }
      } catch (e) {
        console.warn("[AdManager] failed to read ads-removed", e);
      }
    })();
  }, []);

  // helper: persist flag
  const persistAdsRemoved = async (value = true) => {
    try {
      await AsyncStorage.setItem(ADS_REMOVED_KEY, value ? "1" : "0");
      setIsAdsRemoved(!!value);
      return true;
    } catch (e) {
      console.warn("[AdManager] failed to persist ads-removed", e);
      return false;
    }
  };

  // call this to mark the user as paid (after verifying purchase)
  const removeAds = async ({ verifiedBy = "local" } = {}) => {
    // If you have server verification or RevenueCat verification,
    // call it here before persisting. For now we persist immediately.
    // Return true if flag persisted.
    return await persistAdsRemoved(true);
  };

  // restore purchases: placeholder. Should call your IAP / RevenueCat restore APIs.
  // Return true if a valid previous purchase was found/verified.
  const restorePurchases = async () => {
    if (loadingAdsRemovedRef.current) return false;
    loadingAdsRemovedRef.current = true;
    try {
      // TODO: integrate with your IAP library or RevenueCat here.
      // Example: check store for purchased non-consumable; if found -> persist true
      // For now we just return the local persisted flag (already loaded on mount).
      const val = await AsyncStorage.getItem(ADS_REMOVED_KEY);
      loadingAdsRemovedRef.current = false;
      if (val === "1") {
        setIsAdsRemoved(true);
        return true;
      }
      return false;
    } catch (e) {
      loadingAdsRemovedRef.current = false;
      console.warn("[AdManager] restorePurchases error", e);
      return false;
    }
  };

  // -----------------------
  // Setup App Open ad
  // -----------------------
  useEffect(() => {
    appOpenAdRef.current = AppOpenAd.createForAdRequest(APP_OPEN_UNIT_ID, {});

    const unsubLoaded = appOpenAdRef.current.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log("[AdManager] AppOpenAd loaded");
        setAppOpenLoaded(true);
        if (loadingResolveAppOpenRef.current) {
          loadingResolveAppOpenRef.current(true);
          loadingResolveAppOpenRef.current = null;
          loadingRejectAppOpenRef.current = null;
          loadingPromiseAppOpenRef.current = null;
        }
      }
    );

    const unsubClosed = appOpenAdRef.current.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log("[AdManager] AppOpenAd closed — reloading");
        setAppOpenLoaded(false);
        try {
          appOpenAdRef.current.load();
        } catch (e) {}
      }
    );

    const unsubError = appOpenAdRef.current.addAdEventListener(
      AdEventType.ERROR,
      (err) => {
        console.warn("[AdManager] AppOpenAd error", err);
        setAppOpenLoaded(false);
        if (loadingRejectAppOpenRef.current) {
          loadingRejectAppOpenRef.current(err);
          loadingResolveAppOpenRef.current = null;
          loadingRejectAppOpenRef.current = null;
          loadingPromiseAppOpenRef.current = null;
        }
        setTimeout(() => {
          try {
            appOpenAdRef.current?.load();
          } catch (e) {}
        }, 2000);
      }
    );

    try {
      appOpenAdRef.current.load();
      console.log("[AdManager] requested initial AppOpenAd load");
    } catch (e) {
      console.warn("[AdManager] AppOpen initial load error", e);
    }

    return () => {
      try {
        unsubLoaded();
        unsubClosed();
        unsubError();
      } catch (e) {}
    };
  }, []);

  // -----------------------
  // Setup Rewarded Interstitial ad (correct event enums & flow)
  // -----------------------
  useEffect(() => {
    rewardedAdRef.current = RewardedInterstitialAd.createForAdRequest(
      REWARDED_INTERSTITIAL_UNIT_ID,
      {}
    );

    // LOADED (use AdEventType)
    const unsubRewardedLoaded = rewardedAdRef.current.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log("[AdManager] RewardedInterstitial loaded");
        setRewardedLoaded(true);

        if (loadingResolveRewardedRef.current) {
          loadingResolveRewardedRef.current(true);
          loadingResolveRewardedRef.current = null;
          loadingRejectRewardedRef.current = null;
          loadingPromiseRewardedRef.current = null;
        }
      }
    );

    // EARNED REWARD (use RewardedAdEventType)
    const unsubRewardedEarned = rewardedAdRef.current.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log("[AdManager] RewardedInterstitial earned reward", reward);
        // store reward; we'll resolve the pending promise when the ad closes
        pendingRewardGrantedRef.current = true;
        pendingRewardObjectRef.current = reward;
      }
    );

    // CLOSED (use AdEventType)
    const unsubRewardedClosed = rewardedAdRef.current.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log("[AdManager] RewardedInterstitial closed — reloading");

        // If there's a pending show promise, resolve it now with earned flag + reward if any
        if (pendingRewardResolveRef.current) {
          const result = {
            earned: !!pendingRewardGrantedRef.current,
            reward: pendingRewardGrantedRef.current
              ? pendingRewardObjectRef.current
              : null,
          };
          pendingRewardResolveRef.current(result);
          pendingRewardResolveRef.current = null;
          pendingRewardRejectRef.current = null;
        }

        // reset flags & reload
        pendingRewardGrantedRef.current = false;
        pendingRewardObjectRef.current = null;
        setRewardedLoaded(false);
        try {
          rewardedAdRef.current.load();
        } catch (e) {
          console.warn("[AdManager] rewarded reload error", e);
        }
      }
    );

    // ERROR (use AdEventType)
    const unsubRewardedError = rewardedAdRef.current.addAdEventListener(
      AdEventType.ERROR,
      (err) => {
        console.warn("[AdManager] RewardedInterstitial error", err);
        setRewardedLoaded(false);

        // reject any pending load promise
        if (loadingRejectRewardedRef.current) {
          loadingRejectRewardedRef.current(err);
          loadingResolveRewardedRef.current = null;
          loadingRejectRewardedRef.current = null;
          loadingPromiseRewardedRef.current = null;
        }

        // reject any pending show promise
        if (pendingRewardRejectRef.current) {
          pendingRewardRejectRef.current(err);
          pendingRewardResolveRef.current = null;
          pendingRewardRejectRef.current = null;
        }

        // cleanup and reload later
        setTimeout(() => {
          try {
            rewardedAdRef.current?.load();
          } catch (e) {}
        }, 2000);
      }
    );

    // initial load
    try {
      rewardedAdRef.current.load();
      console.log("[AdManager] requested initial RewardedInterstitial load");
    } catch (e) {
      console.warn("[AdManager] RewardedInterstitial initial load error", e);
    }

    return () => {
      try {
        unsubRewardedLoaded();
        unsubRewardedEarned();
        unsubRewardedClosed();
        unsubRewardedError();
      } catch (e) {}
      // extra cleanup: clear pending timers and reject pending promises if any
      if (rewardedShowTimeoutRef.current) {
        clearTimeout(rewardedShowTimeoutRef.current);
        rewardedShowTimeoutRef.current = null;
      }
      if (pendingRewardRejectRef.current) {
        pendingRewardRejectRef.current(new Error("AdManager unmounted"));
        pendingRewardResolveRef.current = null;
        pendingRewardRejectRef.current = null;
      }
    };
  }, []);

  // -----------------------
  // Helpers: waitForLoad (AppOpen & Rewarded)
  // -----------------------
  const waitForAppOpenLoad = () => {
    if (appOpenLoaded) return Promise.resolve(true);
    if (loadingPromiseAppOpenRef.current)
      return loadingPromiseAppOpenRef.current;

    loadingPromiseAppOpenRef.current = new Promise((resolve, reject) => {
      loadingResolveAppOpenRef.current = (val) => {
        loadingPromiseAppOpenRef.current = null;
        resolve(val);
      };
      loadingRejectAppOpenRef.current = (err) => {
        loadingPromiseAppOpenRef.current = null;
        reject(err);
      };

      try {
        appOpenAdRef.current?.load();
      } catch (e) {
        loadingRejectAppOpenRef.current(e);
      }

      // timeout
      const t = setTimeout(() => {
        if (loadingRejectAppOpenRef.current) {
          loadingRejectAppOpenRef.current(new Error("AppOpen load timeout"));
        }
      }, LOAD_TIMEOUT_MS);

      // wrap to clear timeout
      const origResolve = loadingResolveAppOpenRef.current;
      const origReject = loadingRejectAppOpenRef.current;
      loadingResolveAppOpenRef.current = (val) => {
        clearTimeout(t);
        origResolve && origResolve(val);
      };
      loadingRejectAppOpenRef.current = (err) => {
        clearTimeout(t);
        origReject && origReject(err);
      };
    });

    return loadingPromiseAppOpenRef.current;
  };

  const waitForRewardedLoad = () => {
    if (rewardedLoaded) return Promise.resolve(true);
    if (loadingPromiseRewardedRef.current)
      return loadingPromiseRewardedRef.current;

    loadingPromiseRewardedRef.current = new Promise((resolve, reject) => {
      loadingResolveRewardedRef.current = (val) => {
        loadingPromiseRewardedRef.current = null;
        resolve(val);
      };
      loadingRejectRewardedRef.current = (err) => {
        loadingPromiseRewardedRef.current = null;
        reject(err);
      };

      try {
        rewardedAdRef.current?.load();
      } catch (e) {
        loadingRejectRewardedRef.current(e);
      }

      const t = setTimeout(() => {
        if (loadingRejectRewardedRef.current) {
          loadingRejectRewardedRef.current(new Error("Rewarded load timeout"));
        }
      }, LOAD_TIMEOUT_MS);

      const origResolve = loadingResolveRewardedRef.current;
      const origReject = loadingRejectRewardedRef.current;
      loadingResolveRewardedRef.current = (val) => {
        clearTimeout(t);
        origResolve && origResolve(val);
      };
      loadingRejectRewardedRef.current = (err) => {
        clearTimeout(t);
        origReject && origReject(err);
      };
    });

    return loadingPromiseRewardedRef.current;
  };

  // -----------------------
  // Public API: showAppOpen
  // -----------------------
  const showAppOpen = async () => {
    // SHORT-CIRCUIT: do not show any app-open if user removed ads
    if (isAdsRemoved) {
      // quick early return; apps that use the boolean can avoid calling this
      console.log("[AdManager] showAppOpen skipped (ads removed)");
      return false;
    }

    try {
      const now = Date.now();
      if (now - lastAppOpenShownAtRef.current < MIN_SHOW_INTERVAL_MS) {
        console.log("[AdManager] showAppOpen skipped (rate limit)");
        return false;
      }
      if (!appOpenAdRef.current) {
        console.warn("[AdManager] no AppOpen instance");
        return false;
      }
      if (!appOpenLoaded) {
        try {
          const loaded = await waitForAppOpenLoad();
          if (!loaded) {
            console.warn("[AdManager] app-open not loaded in time");
            return false;
          }
        } catch (err) {
          console.warn("[AdManager] waitForAppOpenLoad failed", err);
          return false;
        }
      }
      try {
        appOpenAdRef.current.show();
        lastAppOpenShownAtRef.current = Date.now();
        return true;
      } catch (e) {
        console.warn("[AdManager] showAppOpen error", e);
        return false;
      }
    } catch (err) {
      console.warn("[AdManager] unexpected showAppOpen error", err);
      return false;
    }
  };

  // -----------------------
  // Public API: showRewardedInterstitial
  // returns { earned: boolean, reward: object|null }
  // -----------------------
  const showRewardedInterstitial = async () => {
    // SHORT-CIRCUIT: do not show rewarded/interstitials if user removed ads
    if (isAdsRemoved) {
      console.log("[AdManager] showRewardedInterstitial skipped (ads removed)");
      return { earned: false, reward: null };
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Prevent concurrent show calls
        if (isShowingRewardedRef.current) {
          return reject(new Error("A rewarded ad is already being shown"));
        }
        isShowingRewardedRef.current = true;

        if (!rewardedAdRef.current) {
          isShowingRewardedRef.current = false;
          return reject(new Error("RewardedInterstitial not initialized"));
        }

        // Wait for load
        if (!rewardedLoaded) {
          try {
            const ok = await waitForRewardedLoad();
            if (!ok) {
              isShowingRewardedRef.current = false;
              return reject(new Error("Rewarded ad did not load in time"));
            }
          } catch (err) {
            isShowingRewardedRef.current = false;
            return reject(err);
          }
        }

        // set up pending resolve/reject for the CLOSED handler to use
        pendingRewardGrantedRef.current = false;
        pendingRewardObjectRef.current = null;

        pendingRewardResolveRef.current = (val) => {
          // clear guard and any timer
          isShowingRewardedRef.current = false;
          if (rewardedShowTimeoutRef.current) {
            clearTimeout(rewardedShowTimeoutRef.current);
            rewardedShowTimeoutRef.current = null;
          }
          pendingRewardResolveRef.current = null;
          pendingRewardRejectRef.current = null;
          resolve(val);
        };
        pendingRewardRejectRef.current = (err) => {
          isShowingRewardedRef.current = false;
          if (rewardedShowTimeoutRef.current) {
            clearTimeout(rewardedShowTimeoutRef.current);
            rewardedShowTimeoutRef.current = null;
          }
          pendingRewardResolveRef.current = null;
          pendingRewardRejectRef.current = null;
          reject(err);
        };

        // show the ad
        try {
          rewardedAdRef.current.show();

          // safety timeout (in case events never fire)
          rewardedShowTimeoutRef.current = setTimeout(() => {
            if (pendingRewardResolveRef.current) {
              pendingRewardResolveRef.current({ earned: false, reward: null });
            } else {
              // ensure guard removed if resolve already cleared
              isShowingRewardedRef.current = false;
              rewardedShowTimeoutRef.current = null;
            }
          }, 15000);
        } catch (e) {
          // cleanup on immediate show error
          isShowingRewardedRef.current = false;
          pendingRewardResolveRef.current = null;
          pendingRewardRejectRef.current = null;
          if (rewardedShowTimeoutRef.current) {
            clearTimeout(rewardedShowTimeoutRef.current);
            rewardedShowTimeoutRef.current = null;
          }
          reject(e);
        }
      } catch (err) {
        isShowingRewardedRef.current = false;
        reject(err);
      }
    });
  };

  // -----------------------
  // Auto-show on app foreground (uses showAppOpen which handles readiness/rate-limit)
  // -----------------------
  useEffect(() => {
    if (!showAppOpenOnForeground) return;

    const handleChange = (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        showAppOpen().then((shown) =>
          console.log("[AdManager] app-foreground showAppOpen result:", shown)
        );
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleChange);
    return () => {
      try {
        subscription.remove();
      } catch {
        if (typeof subscription === "function") subscription();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAppOpenOnForeground, appOpenLoaded]);

  // -----------------------
  // Context value & return
  // -----------------------
  const ctxValue = {
    showAppOpen,
    showRewardedInterstitial,
    isAppOpenLoaded: appOpenLoaded,
    isRewardedLoaded: rewardedLoaded,
    isAdsRemoved,
    removeAds,
    restorePurchases,
  };

  return <AdsContext.Provider value={ctxValue}>{children}</AdsContext.Provider>;
}

export function useAds() {
  return useContext(AdsContext);
}
