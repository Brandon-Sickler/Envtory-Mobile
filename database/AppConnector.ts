import { PowerSyncBackendConnector, CommonPowerSyncDatabase } from '@powersync/react-native';


/**
 * APPConnector manages the connection between the local op-sqlite offline database and
 * the remote Spring Boot server. 
 * 
 */

export class AppConnector implements PowerSyncBackendConnector {

    //First step is to authenticate with powersync service
    async fetchCredentials() {
        //THIS IS A TEMPORARY TOKEN FOR DEVELOPMENT PURPOSES ONLY. 
        //In production need to use a new token.

        return {
            endpoint: process.env.EXPO_PUBLIC_POWERSYNC_ENDPOINT || '',
            token: process.env.EXPO_PUBLIC_POWERSYNC_TOKEN || ''
    }
}

    //2nd step is upload local changes to springboot backend
    async uploadData(database: CommonPowerSyncDatabase) {

        //get the next batch of offline changes from local queue
        const transaction = await database.getNextCrudTransaction();
        if (!transaction) return;

        //HARDCODING TEMP TOKEN FOR TESTING, REPLACE FOR DYNAMIC TOKEN IN PRODUCTION
        //***************************************************************
        const token = process.env.EXPO_PUBLIC_POWERSYNC_TOKEN;
        const SPRING_BOOT_BASE_URL = 'http://10.0.2.2:8080/api';

        try {
            //loop through every insert, update, or delete the user made
            for (const operation of transaction.crud) {
                const { op, table, opData, id } = operation;

                let endpoint = `${SPRING_BOOT_BASE_URL}/${table}`;
                let method = '';
                let body = opData ? JSON.stringify({id, ...opData}) : null;


                /**
                 * Custom routing interceptor
                 * SPring boot uses nested routes for boards to enforse strict relational boundries
                 * This intercepts flat lumber_boards operations and formats them to /api/runs/{runId}/boards
                 * 
                 */
                if (table === 'lumber_boards' && opData?.run_id) {
                    endpoint = `${SPRING_BOOT_BASE_URL}/runs/${opData.run_id}/boards`;
                }
                else if (table === 'lumber_bundles') {
                    //renaming route for bundles
                    endpoint = `${SPRING_BOOT_BASE_URL}/bundles`;
                }
                else if (table === 'run_grades_allowed' && opData?.run_id) {
                    endpoint = `${SPRING_BOOT_BASE_URL}/runs/${opData.run_id}/grades`;
                }
                else if (table === 'run_species_allowed' && opData?.run_id) {
                    endpoint = `${SPRING_BOOT_BASE_URL}/runs/${opData.run_id}/species`;
                }
                else if (table === 'run_thicknesses_allowedd' && opData?.run_id) {
                    endpoint = `${SPRING_BOOT_BASE_URL}/runs/${opData.run_id}/thicknesses`;
                }
                else if (table === 'lumber_bundle_lengths_included' && opData?.lumber_bundle_id) {
                    endpoint = `${SPRING_BOOT_BASE_URL}/bundles/${opData.lumber_bundle_id}/lengths`;
                }
                //Add additional interceptors here if lumber_bundles or other tables are also nested
                //===========================================

                //Map powersync's offline operation to the correct HTTP method
                if (op === 'PUT') {
                    method = 'POST'; //New records
                }else if (op === 'PATCH') {
                    method = 'PUT'; //Updates
                    endpoint = `${endpoint}/${id}`; //Append ID for standard REST update
                }else if (op === 'DELETE') {
                    method = 'DELETE'; //Deletions
                    endpoint = `${endpoint}/${id}`;
                }

                //Send the request to the Spring Boot server
                const response = await fetch(endpoint, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: method !== 'DELETE' ? body : undefined
                });
                
                if (!response.ok){
                    throw new Error(`Spring Boot rejected ${method} on ${table}: ${response.statusText}`);
                }
            }

            await transaction.complete();
        }catch (error) {
            console.error("Upload failed, Powersync will retry autmoatically:", error);
            throw error;
        }
    }
}