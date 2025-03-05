import {body, param, validationResult} from 'express-validator';
import {SubscriberService} from "../service";
import {Subscriber} from "../model";
import {Router, Request, Response} from "express";
import {authenticateToken} from "../../auth";

export const router = Router();

/**
 * Middleware to validate phone number format.
 */
const validatePhoneNumber = param('phoneNumber').matches(/^\d{10,15}$/).withMessage('Invalid phone number format');

/**
 * Middleware array to validate subscriber details in the request body.
 */
const validateSubscriber = [
    body('username').isString().withMessage('username must be a string'),
    body('password').isString().isLength({min: 8}).withMessage('password must be at least 8 characters long'),
    body('domain').isString().isFQDN().withMessage('domain must be a valid domain'),
    body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('status must be either ACTIVE or INACTIVE'),
    body('features.callForwardNoReply.provisioned').optional().isBoolean(),
    body('features.callForwardNoReply.destination').optional().isString().matches(/^tel:\+\d{10,15}$/)
];

/**
 * Route to get a subscriber by phone number.
 */
router.get('/subscriber/:phoneNumber', authenticateToken, validatePhoneNumber, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    try {
        const subscriber = await SubscriberService.getSubscriber(req.params.phoneNumber);
        if (!subscriber) return res.status(404).json({message: 'Subscriber not found'});
        res.json(subscriber);
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }

});

/**
 * Route to add or update a subscriber.
 */
router.put('/subscriber/:phoneNumber', authenticateToken, validatePhoneNumber, validateSubscriber, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    try {
        const subscriber: Subscriber = req.body as Subscriber;
        subscriber.phoneNumber = req.params.phoneNumber;
        await SubscriberService.upsertSubscriber(subscriber);
        res.json({message: 'Subscriber added/updated successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

/**
 * Route to delete a subscriber.
 */
router.delete('/subscriber/:phoneNumber', authenticateToken, validatePhoneNumber, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({errors: errors.array()});

    try {
        await SubscriberService.deleteSubscriber(req?.params?.phoneNumber);
        res.json({message: 'Subscriber deleted successfully'});
    } catch (error) {
        res.status(500).json({message: 'Server error', error});
    }
});

export {router as subscriberRouter};
