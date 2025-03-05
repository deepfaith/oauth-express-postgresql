import {getClient} from "../../../db";
import {Subscriber} from "../model";

/**
 * Provides services for managing subscribers in the database.
 */
export class SubscriberService {
    /**
     * Retrieves a subscriber by their phone number.
     * @param {string} phoneNumber - The phone number of the subscriber to retrieve.
     * @returns {Promise<Subscriber>} The subscriber object if found, otherwise undefined.
     */
    static async getSubscriber(phoneNumber: string) {
        const dbClient = await getClient();

        const result = await dbClient.query('SELECT * FROM subscribers WHERE phone_number = $1', [phoneNumber]);
        return result.rows[0];
    }

    /**
     * Inserts a new subscriber or updates an existing one based on the phone number.
     * @param {Subscriber} subscriber - The subscriber object to insert or update.
     * @returns {Promise<void>}
     */
    static async upsertSubscriber(subscriber: Subscriber) {
        const dbClient = await getClient();

        await dbClient.query(
            `INSERT INTO subscribers (phone_number, username, password, domain, status, features)
             VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (phone_number) DO
            UPDATE SET username = $2, password = $3, domain = $4, status = $5, features = $6`,
            [subscriber.phoneNumber, subscriber.username, subscriber.password, subscriber.domain, subscriber.status, JSON.stringify(subscriber.features)]
        );
    }

    /**
     * Deletes a subscriber from the database by their phone number.
     * @param {string} phoneNumber - The phone number of the subscriber to delete.
     * @returns {Promise<void>}
     */
    static async deleteSubscriber(phoneNumber: string) {
        const dbClient = await getClient();

        await dbClient.query('DELETE FROM subscribers WHERE phone_number = $1', [phoneNumber]);
    }
}
