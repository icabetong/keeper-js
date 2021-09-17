import axios, { AxiosResponse } from "axios";
import { auth, firestore } from "../../index";
import { DocumentSnapshot, DocumentData, Timestamp } from "@firebase/firestore-types";

import { Status, AssetCore } from "../asset/Asset";
import { UserCore } from "../user/User";

import {
    assetCollection,
    assignmentCollection,
    assetStatus
} from "../../shared/const";

export type Assignment = {
    assignmentId: string
    asset?: AssetCore
    user?: UserCore
    dateAssigned?: Timestamp
    dateReturned?: Timestamp
    location?: string
    remarks?: string
}

const SERVER_URL = "https://deshi-production.up.railway.app";
export class AssignmentRepository {

    static async create(assignment: Assignment, sender: string): Promise<AxiosResponse<any>> {
        let batch = firestore.batch();

        batch.set(firestore.collection(assignmentCollection)
            .doc(assignment.assignmentId), assignment);

        if (assignment.asset?.assetId !== undefined)
            batch.update(firestore.collection(assetCollection)
                .doc(assignment.asset?.assetId), assetStatus, Status.OPERATIONAL);

        await batch.commit();
        let idToken = await auth.currentUser?.getIdToken(false);
    
        return await axios.post(`${SERVER_URL}/send-notification`, {
            token: idToken,
            title: "notification_assigned_title",
            body: "notification_assigned_body",
            payload: assignment.assignmentId,
            senderId: auth.currentUser?.uid,
            receiverId: assignment.user?.userId,
            extras: {
                sender: sender,
                target: assignment.asset?.assetName
            }
        })
    }

    static async remove(assignment: Assignment): Promise<any> {
        const batch = firestore.batch();

        batch.delete(firestore.collection(assignmentCollection)
            .doc(assignment.assignmentId));
        
        if (assignment.asset?.assetId !== undefined)
            batch.update(firestore.collection(assetCollection)
                .doc(assignment.assignmentId), assetStatus, Status.IDLE);

        await batch.commit();
    }
}