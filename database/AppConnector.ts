import { PowerSyncBackendConnector, CommonPowerSyncDatabase } from '@powersync/react-native';

export class AppConnector implements PowerSyncBackendConnector {

    //First step is to authenticate with powersync service
    async fetchCredentials() {
        //THIS IS A TEMPORARY TOKEN FOR DEVELOPMENT PURPOSES ONLY. 
        //In production need to use a new token.

        return {
            endpoint: 'https://6ac2adc63b1803753bcef1d0.powersync.journeyapps.com',
            token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6InBvd2Vyc3luYy1kZXYtMzIyM2Q0ZTMifQ.eyJzdWIiOiJ0ZXN0LWdyYWRlci0xIiwiaWF0IjoxNzkxMTQ5MDAxLCJpc3MiOiJodHRwczovL3Bvd2Vyc3luYy1hcGkuam91cm5leWFwcHMuY29tIiwiYXVkIjoiaHR0cHM6Ly82YWMyYWRjNjNiMTgwMzc1M2JjZWYxZDAucG93ZXJzeW5jLmpvdXJuZXlhcHBzLmNvbSIsImV4cCI6MTc5MTE5MjIwMX0.PD-mQIxzsOITObPMtKlF4UBLDJ42XHeiFlD7iDGmzalSG80Qces60tqnxr7NZR8SjiyjoHV0qnd0QIsg1D5XMCozwdQJVzzsPFhyXpiT4_G9ts2E7RUxQ7gw7bLFWLZfve7NDQuQKydYSByyhlnEmnskzgh7tquvOmFOLp9plCYGBAL99x0LaOqBFToOPbV87L5bZAtmHIe0ukWjkhEDAA9XhaOVJlDfwB5z9JT80myXTtCohBkRllgIHpiB_JmKyVR8MSnbiEZGL-Se9D67NF5CklHEjb_WS3PXIvLXkB-SgKiAMg6sVmUoRjKM3TfdvonNz9tWv7sdjsgO8ZA2eA'
        };
    }

    //2nd step is upload local changes to springboot backend
    async uploadData(database: CommonPowerSyncDatabase) {

        //get the next batch of offline changes from local queue
        const transaction = await database.getNextCrudTransaction();
        if (!transaction) return;

        //HARDCODING TEMP TOKEN FOR TESTING, REPLACE FOR DYNAMIC TOKEN IN PRODUCTION
        //***************************************************************
        const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InBvd2Vyc3luYy1kZXYtMzIyM2Q0ZTMifQ.eyJzdWIiOiJ0ZXN0LWdyYWRlci0xIiwiaWF0IjoxNzkxMTQ5MDAxLCJpc3MiOiJodHRwczovL3Bvd2Vyc3luYy1hcGkuam91cm5leWFwcHMuY29tIiwiYXVkIjoiaHR0cHM6Ly82YWMyYWRjNjNiMTgwMzc1M2JjZWYxZDAucG93ZXJzeW5jLmpvdXJuZXlhcHBzLmNvbSIsImV4cCI6MTc5MTE5MjIwMX0.PD-mQIxzsOITObPMtKlF4UBLDJ42XHeiFlD7iDGmzalSG80Qces60tqnxr7NZR8SjiyjoHV0qnd0QIsg1D5XMCozwdQJVzzsPFhyXpiT4_G9ts2E7RUxQ7gw7bLFWLZfve7NDQuQKydYSByyhlnEmnskzgh7tquvOmFOLp9plCYGBAL99x0LaOqBFToOPbV87L5bZAtmHIe0ukWjkhEDAA9XhaOVJlDfwB5z9JT80myXTtCohBkRllgIHpiB_JmKyVR8MSnbiEZGL-Se9D67NF5CklHEjb_WS3PXIvLXkB-SgKiAMg6sVmUoRjKM3TfdvonNz9tWv7sdjsgO8ZA2eA';

        const SPRING_BOOT_BASE_URL = 'http://10.0.2.2:8080/api';

        try {
            //loop through every insert, update, or delete the user made
            for (const operation of transaction.crud) {
                const { op, table, opData, id } = operation;

                let endpoint = `${SPRING_BOOT_BASE_URL}/${table}`;
                let method = '';
                let body = opData ? JSON.stringify({id, ...opData}) : null;

                if (op === 'PUT') {
                    method = 'POST';
                }else if (op === 'PATCH') {
                    method = 'PUT';
                    endpoint = `${endpoint}/${id}`;
                }else if (op === 'DELETE') {
                    method = 'DELETE';
                    endpoint = `${endpoint}/${id}`;
                }

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