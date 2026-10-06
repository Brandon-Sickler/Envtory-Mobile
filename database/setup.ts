import { PowerSyncDatabase }  from "@powersync/react-native";
import { AppSchema} from './AppSchema';
import { AppConnector } from './AppConnector';

//First create the local SQLite database instance using the schema
export const db = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
        dbFilename: 'envtory-offline.sqlite'
    }
});

//Second initialize the database and connect the Spring Boot router
export const setupPowerSync = async () => {
    await db.init();
    const connector = new AppConnector();
    await db.connect(connector);
};