const admin = require('firebase-admin');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
admin.initializeApp();
require("firebase-functions/logger/compat");
const db = admin.firestore();
const messaging = admin.messaging();

exports.sendNotification = onDocumentCreated("Users/{userId}/Diary/{diaryId}", async (event) => {
    const uid = event.params.userId;
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }
    const noCaregiverDoc = await db.collection("Users").doc(uid).get();
    const noCaregiverData = noCaregiverDoc.data();
    const linkedAccountUid = noCaregiverData.linkedAccount;
    if(!linkedAccountUid){
        console.log("連携先が存在していません");
        return;
    }

    const linkedAccountDoc = await db.collection("Users").doc(linkedAccountUid).get();
    const linkedAccountData = linkedAccountDoc.data();
    const fcmToken = linkedAccountData.fcm_token;
    if(!fcmToken){
        console.log("連携先相手のFCMトークンが登録されていません");
        return;
    }

    const message = {
        notification: {
            title: "今日の体調が送信されました",
            body: "顔写真とボイスメッセージで今日の様子を確認しましょう！"
        },
        token: fcmToken
    }

    messaging.send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
});