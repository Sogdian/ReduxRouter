import { configureStore } from "@reduxjs/toolkit";
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';

import { reducer1 } from "./feature1/reducer1";
import { reducer2 } from "./feature2/reducer2";
import { middleware1 } from "./middlewares/middleware1";
import { middleware2 } from "./middlewares/middleware2";

export const store = configureStore({
    reducer: {
        feature1: reducer1,
        feature2: reducer2,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(middleware1, middleware2);
    },
    enhancers: (getDefaultEnhancers) => {
        return getDefaultEnhancers().concat(offline(offlineConfig))
    }
});