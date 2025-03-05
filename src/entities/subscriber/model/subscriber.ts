// Subscriber Model
export interface Subscriber {
    phoneNumber: string;
    username: string;
    password: string;
    domain: string;
    status: 'ACTIVE' | 'INACTIVE';
    features?: {
        callForwardNoReply?: {
            provisioned: boolean;
            destination: string;
        };
    };
}
