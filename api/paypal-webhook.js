import { buffer } from "micro";
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: "samonya-digital-universe",
      private_key_id: "895a7afd7dbaa2881e3ebbb9bcea69aa5fa44bf1",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDd8m92+FEjIe1K\nq7on38/NwHhEnlMIQNgSxh21K4fF8mAoO5TGMN6uxMoneL4yjhHd2X00BsgfClV5\nGm94RboAoEEcYa+CI5RKhugGGY+qT7bPD9Txbn2vlXNVVX4sgmQfgeb7SdhBstII\nUZZ5GfvL3xfC2UQTGrRsLFWIGahQ6v9Y3HWA21RxvfdqStib5KaLd+bb5pRDTkUc\n/GThmmEXg3hMiPskAeSzS0oWPC3sBvWWuPhDohMf7UQOmMmoTSwSr9tPTAJ0Q4YC\nLewF+FbPpL6K+aOhwxixN8RML95NSja+yKNy9G5KtB4HLzuyVd3fUlmu35K0252p\nk1uCMhO7AgMBAAECggEACa/1vocbH4HxFgPF1cy2iMAAX9pbPG58H+Gm1UwHmpO4\nL7leBoKGjbFIM43ZG2LJE9pU1SsAnB462dTWDbVZZ4KXJPJ8kx0TcWdPBEkkVKYz\nD/mcbUdJ1BqdVJmtLqsoTJnCZ7By8HcqJLPO8g04yM69fkM2bfEJ8/jBaPXZu2JZ\nnRQd0zeSXjcP5jdgqjR870Xi04XuJ1/omDUxclye9XfHdHTJm+joL27qt2B15aCx\nb6KoSs+3zzoxGbZ0PmZYjL866z2KVLr+3SDFWm5dHE+rGCjVOPXryAgn28TKSwEH\nsd7TZGsv1E0tCZ7TwkJAw7V84QLdaY/72+14QjjvKQKBgQD3moBHZs8kvxGARKNA\naG8vUfS7QizOyKNdljpYvmFUjjmGw9H2z5LATF6pQxp2iSfnV7Tzs8ME8fzfCwdj\nrQb1peklZRi0Suc0FRvqrC07TJXku13vLJHePyj1+XVnrUxT6vMUnpbPXuzb1LtC\n8jzE6p6kUTrYgElVph1kTca/gwKBgQDleTRogxQ7tZapxrh5lhz80S1s5SWYy0CK\n44nUsMwxzY1XC31r0B1V3LwyuER16a/uT9UVkZ2UP2PypegfbY0Y1qsWK0/CH2XA\n2Abo2xgRvclSYD0HqWZSY76J9LNjRIs5sO3r+Mh0l0t09XlxEYmLsRDo006vVpa3\n49b2HRataQKBgGrgvRiVDzscYrCMcC+AJOY3KT2fjfngb2wZSaw+2YKHNduvMTWp\nWf45uO61MXoTMC9TE5/Sa4756Z5Zg2IKMSPd7uqeXfCNGInJxtggZBHhuB4Ypq5z\n/a8CcmriuEP9cSIUG8M9xXlTz0gA5qg6KfMSF1J0YcNMdNtMrgk67VyDAoGBAIXI\nZAWKZgFpnKzebi50lfHPAey6q3CpDrfqcDDP4jwm2oAk8rooWvHz/sSTKVaVJzyI\nznIEsxn62wpcLzgjZl9Ux+nk1lsWcvw69cxL73xoaTbdZLdSy5S9Ehjb0LnO/Fxm\nCk/IexV+Hz/Q3TxOPSJz2KfkibsvgC81Zd2Wl+IBAoGAfs3A1GSC4Hhf9J8d9IHs\nA+mw/gv7cuMH6IfVCI2/h8Um4LtSePua/an2tGqqm2m3rgQkanaAqHPOawMZeM7i\nClZJ2Yi6rqgQ+e0bbNIsnqyf3FUZpOmStyqVyEzjcWK0XmGz9Ab3BlybCiZtTZX6\n38ic3EDlhJZDe/T2naOoSrM=\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-fbsvc@samonya-digital-universe.iam.gserviceaccount.com",
      client_id: "100429679320356194657",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40samonya-digital-universe.iam.gserviceaccount.com"
    }),
    databaseURL: "https://samonya-digital-universe.firebaseio.com"
  });
}

const db = admin.firestore();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const buf = await buffer(req);
    const webhookEvent = JSON.parse(buf.toString());

    const eventType = webhookEvent.event_type;

    try {
      if (
        eventType === "BILLING.SUBSCRIPTION.ACTIVATED" ||
        eventType === "PAYMENT.SALE.COMPLETED"
      ) {
        const subscriptionId = webhookEvent.resource.id;
        const payerEmail =
          webhookEvent.resource.subscriber?.email_address || null;

        if (payerEmail) {
          const usersRef = db.collection("users");
          const snapshot = await usersRef.where("email", "==", payerEmail).get();
          if (!snapshot.empty) {
            snapshot.forEach(async (docSnap) => {
              await docSnap.ref.update({
                subscriptionStatus: "active",
                subscriptionPlan: "Samonya Premium",
                paypalSubscriptionId: subscriptionId,
              });
            });
          }
        }
      } else if (eventType === "BILLING.SUBSCRIPTION.CANCELLED") {
        const subscriptionId = webhookEvent.resource.id;
        const usersRef = db.collection("users");
        const snapshot = await usersRef
          .where("paypalSubscriptionId", "==", subscriptionId)
          .get();
        if (!snapshot.empty) {
          snapshot.forEach(async (docSnap) => {
            await docSnap.ref.update({
              subscriptionStatus: "inactive",
            });
          });
        }
      }

      res.status(200).send("OK");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error processing webhook");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
